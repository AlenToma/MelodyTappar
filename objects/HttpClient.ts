import DomParser from 'advanced-html-parser'
import { Element as HTMLElement } from 'advanced-html-parser/types'
export class HttpClient {
  additionalHeader: Map<string, string> = new Map<string, string>();
  staticHeader: Map<string, string> = new Map<string, string>();
  operations: Map<string, AbortController> = new Map<string, AbortController>();
  ignoreHtmlTags?: string[];
  emptyContainer: HTMLElement;

  constructor(ignoreHtmlTags?: string[]) {
    this.ignoreHtmlTags = ignoreHtmlTags;
    this.emptyContainer = DomParser.parse('<div>empty</div>').documentElement;
  }

  addStaticHeader = (key: string, value: string) => {
    if (!this.staticHeader.has(key))
      this.staticHeader.set(key, value);
    return this;
  }

  addHeader = (key: string, value: string) => {
    if (!this.additionalHeader.has(key))
      this.additionalHeader.set(key, value);
    return this;
  }

  fixHtml(html: string) {
    return DomParser.parse(html, {
      ignoreTags: this.ignoreHtmlTags, errorHandler: {
        fatalError: (e) => { console.log(e) },
        error: () => { },
        warning: () => { }
      }
    }).documentElement;
  }

  cleanHTML(html: string, ...attrs: string[]) {
    try {
      attrs.forEach(attr => {
        var pos = 0
        while ((pos = html.indexOf(attr)) > -1) {
          var sep = undefined;
          var state = 0;
          for (var i = pos + attr.length; i < html.length; i++) {
            var c = html.charAt(i);
            if (c == '=') {
              state = 1
              continue;
            }
            if (state == 1 && (c.trim() === '"' || c.trim() === "'")) {
              sep = c;
              break;
            } else if (["'", '"', "=", ""].indexOf(c.trim()) === -1)
              break;
          }

          if (sep) {
            const closingPos = html.indexOf(">", pos);
            const pos_q = html.indexOf(sep, pos);
            let pos_q2 = html.indexOf(sep, pos_q + 1);
            if (pos_q2 > closingPos) // none closing attr
              pos_q2 = closingPos - 1;
            html = html.substring(0, pos) + html.substring(pos_q2 + 1)
          } else html = html.substring(0, pos) + html.substring(pos + attr.length + (state == 1 ? 1 : 0));
        }
      });
    } catch (e) {
      console.error(e);
    }
    return html;
  }

  async getHtml(url: string, isImage?: boolean): Promise<HTMLElement> {
    var container = this.emptyContainer;
    console.log(`Sending html request to ${url}`);
    try {
      let headers = new Headers({
        Accept: '*/*',
        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36",
        referer: url,
      });

      var data = await this.fetchWithTimeout(url, {
        credentials: 'include',
        headers: headers,
        method: 'GET',
        isImage: isImage
      });

      if (data.status === undefined)
        return container;

      if (!data.ok || data.status === 1020) {
        const message = `An error has occured:${data.status}`;
        console.log(message);
      } else {
        console.log('Data is ok. proceed to parse it');
        const html = this.cleanHTML(await data.text(), "[class]", "[id]");
        // this is to fix some html format errors

        container = this.fixHtml(html);
        console.log("Data has been parsed");
      }
    } catch (e) {
      console.log(e);
    }
    return container;
  }

  nodeChildrenToArray(item: HTMLElement | undefined | null, validator?: (item: HTMLElement) => boolean) {
    var nodes = [] as HTMLElement[];
    if (!item)
      return nodes;
    item.children.forEach(x => {
      var el = x as HTMLElement;
      if (el && el.tagName != undefined && (!validator || validator(el)))
        nodes.push(el);
    })
    return nodes;
  }

  parseHtml(html: string) {
    return this.fixHtml(`<div>${html}</div>`)
  }


  async wait(delay: number) {
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  clearOperations() {
    this.operations.forEach(x => {
      try {
        x.abort();
      } catch (error) {

      }
    })

    this.operations.clear();
  }


  async fetchWithTimeout(url: string, options: any) {
    let hasTimedOut = false;
    var key = url + (options.body ? JSON.stringify(options.body) : "");

    if (this.operations.has(key) && !options.isImage)
      this.operations.get(key)?.abort();

    this.operations.set(key, new AbortController());


    const { timeout = 8000 } = options;
    if (!options.totaltimeout)
      options.totaltimeout = 0;

    const header = options.headers;
    if (header) {
      this.additionalHeader.forEach((value, key) => {
        if (header.append !== undefined) {
          console.log("Adding additionalHeader", key, value)
          header.append(key, value);
        }
      });


      this.staticHeader.forEach((value, key) => {
        if (header.append !== undefined) {
          console.log("Adding staticHeader", key, value)
          header.append(key, value);
        }
      });
    }



    var response = {} as Response;
    const id = setTimeout(() => {
      if (options.waitonTimeOut === false)
        return;
      hasTimedOut = true;
      this.operations.get(key)?.abort();
    }, timeout);
    try {

      response = await fetch(url, {
        ...options,
        signal: this.operations.get(key)?.signal
      });
      this.additionalHeader.clear();
      clearTimeout(id);
      this.operations.delete(key);
      if (response.status == 429 || hasTimedOut) { // to many request then retry
        console.log("to many request then retry");
        await this.wait(1000)
        response = await this.fetchWithTimeout(url, options);
      }
      return response;
    } catch (error: any) {
      this.operations.delete(key);
      if (error?.toString()?.indexOf("Aborted") === -1) // ignore abort
        console.log("error" + error.toString());
      if (hasTimedOut && options.totaltimeout < 3) {
        var time = timeout + 500
        options.totaltimeout++
        console.log("operation has timedout, increase timmeout to :" + time);
        options.timeout = time;
        response = await this.fetchWithTimeout(url, options);
      } else console.log(error)
    }

    return response as Response;

  }

  async isOnline(url: string, index?: number): Promise<boolean> {
    try {
      if (!index)
        index = 0;
      var tempUrl = url.split("www.").filter((x, i) => i > 0).join();
      console.log(`Sending isOnline request to ${tempUrl}`);
      let headers = new Headers({
        Accept: '*/*',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36',
      });


      var data = await this.fetchWithTimeout(url, {
        credentials: 'include',
        headers: headers,
        method: 'GET'
      })
      var html = await data.text();
      var isOnline = data.ok && !/Checking your browser before accessing/g.test(html)
      console.log("Parser is:" + (isOnline ? "Online" : "Offline") + " Status:" + data.status);
      return isOnline;
    } catch (error) {
      if (!index || index <= 0) {
        console.log("error something went wrong. lets try agen");
        return await this.isOnline(url, 1);
      }
      console.log("error something went wrong.");
      console.log(error)
      return false;
    }
  }

  async getImage(url: string) {
    console.log("GetImage" + url);
    var args = url.split("?").last<string>();
    if (args) {
      var variables = {} as any
      args.split("&").map(x => {
        variables[x.split("=")[0]] = x.split("=").last<string>();
      });

      if (variables.url) {
        var container = await httpClient.getHtml(variables.url);
        return container.querySelector(variables.selector)?.getAttribute(variables.attr ?? "src");
      }
    }
    return "";
  }

  async GetText(url: string, waitonTimeOut?: boolean): Promise<string | undefined> {
    console.log(`Sending GetText request to ${url}`);
    try {
      let headers = new Headers({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36',
      });

      var data = await this.fetchWithTimeout(url, {
        credentials: 'include',
        method: 'GET',
        cache: 'no-cache',
        headers: headers,
        waitonTimeOut: waitonTimeOut
      });

      if (data.status === undefined)
        return undefined;

      if (!data.ok) {
        const message = `An error has occured:${data.status}`;
        console.log(message);
      } else {
        console.log('Data is ok. proceed to parse it');
        return await data.text();
      }
    } catch (e) {
      console.log(e);
    }
    return undefined;

  }

  async GetJson(url: string): Promise<any | undefined> {
    console.log(`Sending json request to ${url}`);
    try {
      let headers = new Headers({
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36',
      });

      var data = await this.fetchWithTimeout(url, {
        credentials: 'include',
        method: 'GET',
        cache: 'no-cache',
        headers: headers,
      });
      if (data.status === undefined)
        return undefined;

      if (!data.ok) {
        const message = `An error has occured:${data.status}`;
        console.log(message);
      } else {
        console.log('Data is ok. proceed to parse it');
        return await data.json();
      }
    } catch (e) {
      console.log(e);
    }
    return undefined;

  }

  async postEncodedForm(url: any, item?: any) {

    try {
      console.log(`Sending postEcodedForm to ${url}`);

      var formBody = [] as any;
      for (var property in item) {
        var encodedKey = encodeURIComponent(property);
        var encodedValue = encodeURIComponent(item[property]);
        formBody.push(encodedKey + "=" + encodedValue);
      }
      formBody = formBody.join("&");
      console.log("values:" + formBody)
      let headers = new Headers({
        Accept: '*/*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      });
      var data = await this.fetchWithTimeout(url, {
        credentials: 'include',
        method: 'POST',
        body: formBody,
        headers: headers
      });

      if (data.status === undefined)
        return undefined;

      if (!data.ok) {
        const message = `postEcodedForm:An error has occured:${data.status}`;
        console.log(item);
        console.log(message);
      } else {
        console.log('Data is ok. proceed to parse it');
        var text = await data.text();
        try {
          return text && text.indexOf(':') != -1 && text.indexOf('{') != -1 && text.indexOf('}') != -1 ? JSON.parse(text) : text;
        } catch (e) {
          return text;
        }
      }

      return undefined;
    } catch (e) {
      console.log(e);
    }
  }


  async postForm(url: any, item?: any) {
    const formData = new FormData();
    try {
      console.log(`Sending postForm to ${url}`);
      console.log("values:" + JSON.stringify(item))
      if (item)
        Object.keys(item).forEach((x) => {
          formData.append(x, item[x]);
        });
      let headers = new Headers({
        Accept: '*/*',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36',
        referer: url
      });
      var data = await this.fetchWithTimeout(url, {
        credentials: 'include',
        method: 'POST',
        body: formData,
        headers: headers
      });

      if (data.status === undefined)
        return undefined;

      if (!data.ok) {
        const message = `postForm:An error has occured:${data.status}`;
        console.log(item);
        console.log(message);
      } else {
        console.log('Data is ok. proceed to parse it');
        var text = await data.text();
        try {
          return text && text.indexOf(':') != -1 && text.indexOf('{') != -1 && text.indexOf('}') != -1 ? JSON.parse(text) : text;
        } catch (e) {
          return text;
        }
      }

      return undefined;
    } catch (e) {
      console.log(e);
      console.log(formData);
    }
  }


  async postJson(url: any, item?: any) {
    try {
      console.log('sending postJson');
      let headers = new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      });
      var data = await this.fetchWithTimeout(url, {
        credentials: 'include',
        method: 'POST',
        headers: headers,
        body: item ? JSON.stringify(item) : undefined,
      });


      if (data.status === undefined)
        return undefined;
      if (!data.ok) {
        const message = `An error has occured:${data.status}`;
        console.log(message);
      } else {
        console.log('Data is ok. proceed to parse it');
        var text = await data.text();
        try {
          return text && text.indexOf(':') != -1 ? JSON.parse(text) : text;
        } catch (e) {
          return text;
        }
      }

      return undefined;
    } catch (e) {
      console.log(e);
    }
  }

  async imageToBase64String(url: string) {
    console.log(`Sending imageToBase64String request to ${url}`);
    return new Promise<string>(async (resolve) => {
      try {
        let headers = new Headers({
          'Content-Type': 'image/jpeg',
          referer: url,
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36',
        });

        var data = await this.fetchWithTimeout(url, {
          credentials: 'include',
          headers: headers,
          method: 'GET',
          isImage: true
        });


        if (data.status === undefined)
          return undefined;

        if (!data.ok || data.status === 1020) {
          const message = `An error has occured:${data.status}`;
          console.log(message);
          resolve("");
        } else {
          var blob = await data.blob();
          var reader = new FileReader();
          reader.onloadend = function () {
            resolve(reader.result as string);
          }
          reader.readAsDataURL(blob);
        }
      } catch (e) {
        console.log(e);
        resolve("");
      }
    });
  }


  escapeRegex(str: string) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  cloneItem<T>(item: any, appended: any, ignoreKeys?: string[]) {
    var newItem = {} as any;
    if (appended === undefined)
      return item;
    Object.keys(item).forEach((x) => {
      if (Object.keys(appended).find((f) => f == x) && appended[x] !== undefined && (!ignoreKeys || !ignoreKeys.includes(x)))
        newItem[x] = appended[x];
      else newItem[x] = item[x];
    });
    return (newItem as T);
  }
}

const httpClient = new HttpClient();
export default httpClient;
