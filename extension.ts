import DomParser from 'advanced-html-parser';

declare global {
  interface Array<T> {
    asyncForeachWithReturn<B>(callback: (item: T, index: number) => Promise<B | undefined>): Promise<B[]>;

    asyncForeach(callback: (item: T, index: number) => void): void;

    toType<T>(): Array<T>;

    single<T>(): T | undefined;

    last<T>(): T | undefined;

    findAt<T>(index: number): T | undefined;

    counterSplit<T>(this: T[], counter: number): T[][];
  }

  interface Date {
    toSqlightString(): string;

    days_between(): number;
  }

  interface Function {
    Promise<TReturn, TArgs extends any[]>(this: (...a: TArgs) => Promise<TReturn>, parent?: any, ...a: TArgs): Promise<TReturn>;
  }

  interface String {
    uri(homePage?: string | undefined | null): string;
    compine(...path: string[]): string;
    htmlText(structuredText?: boolean): string;
    defaulOnEmpty(defaultValue?: string): string;
    isEmptyOrSpaces(): boolean;
    toHtml(): HTMLDivElement;
    number(): string;
    getImageSourceByUrl(): any;
    formatText(maxChar: number): string[];
    removeNewLine(str: string): string;
    dString(): string | undefined;
    eString(): string | undefined;
    toObject<T>(): T;
    fromSqlightDateString(): Date;
  }
}

Array.prototype.counterSplit = function <T>(this: T[], counter: number): T[][] {
  var items = [] as T[][];

  this.forEach((x, index) => {
    if (items.length <= 0 || index % counter === 0) {
      items.push([]);
    }
    var current = items.last<T[]>() ?? [];
    current.push(x);
  })

  return items;
}

Date.prototype.days_between = function (): number {
  // The number of milliseconds in one day
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  let firstDate = this as any;
  let secondDate = new Date() as any;

  // Convert back to days and return
  const diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay));

  return diffDays;
}

Date.prototype.toSqlightString = function (): string {

  let year = this.getFullYear();
  let month = (this.getMonth() + 1) as any;
  let dt = this.getDate() as any;

  if (dt < 10) {
    dt = '0' + dt;
  }
  if (month < 10) {
    month = '0' + month;
  }

  return year + '-' + month + '-' + dt;

}

String.prototype.fromSqlightDateString = function (): Date {
  try {
    let dString = new String(this);
    return new Date(dString as string);
  } catch (e) {
    console.log(e);
    return new Date();
  }
}


Array.prototype.asyncForeachWithReturn = async function <B>(callback: (item: B, index: number) => Promise<B | undefined>): Promise<B[]> {
  var result = [];
  for (let index = 0; index < this.length; index++) {
    var item = await callback(this[index], index);
    if (item !== undefined)
      result.push(item);
  }

  return result as B[];
}


// this is a good way to prevent the UI from freezing
Function.prototype.Promise = function <TReturn, TArgs extends any[]>(this: (...a: TArgs) => Promise<TReturn>, parent?: any, ...args: TArgs): Promise<TReturn> {
  return new Promise<TReturn>((resolve, reject) => {
    setTimeout(() => {
      var fn = parent ? this.bind(parent) : this;
      fn(...args).then((x: TReturn) => resolve(x)).catch((e: any) => reject(e));
    }, 0);
  });
}


Array.prototype.findAt = function <T>(this: Array<T> | undefined, index: number): T | undefined {
  if (!this)
    return undefined;
  if (index < 0 || index >= this.length)
    return undefined;

  return this[index];
}

Array.prototype.last = function <T>(this: Array<T> | undefined): T | undefined {
  return this ? this[this.length - 1] : undefined;
}

Array.prototype.toType = function <T>(this: Array<T> | undefined): Array<T> | T[] {
  return this ?? [];
}

Array.prototype.single = function <T>(this: Array<T> | undefined): T | undefined {
  return this && this.length > 0 ? this[0] : undefined;
}

Array.prototype.asyncForeach = async function (callback) {
  for (let index = 0; index < this.length; index++) {
    await callback(this[index], index);
  }

}

String.prototype.toObject = function <T>(): T {
  var str = String(this).trim();
  try {
    if (str.startsWith("{") || str.startsWith("["))
      return JSON.parse(str) as T;
  } catch (e) {
    console.log("JsonToObjectError", e);
  }
  return (str as any) as T;
}

String.prototype.toHtml = function (): HTMLDivElement {
  var container = DomParser.parse('<div>' + String(this ?? "") + '</div>').documentElement as any;
  return container as HTMLDivElement;
}

String.prototype.removeNewLine = function (str: string): string {
  var s = String(this);
  if (!s)
    return "";

  return s.replace(/\r?\n|\r/g, str);

}

String.prototype.getImageSourceByUrl = function (): any {
  var url = String(this);
  return {
    uri: url,
    method: 'GET',
    headers: {
      'Content-Type': 'image/jpeg',
      referer: url,
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36',
    }
  } as any
}

String.prototype.formatText = function (maxCounter: number): string[] {
  var txt = String(this);
  var txtArray = [] as string[];
  var str = '';

  txt = txt
    .replace(/(?=&)(.*?)(;)/g, '')
    .replace(/[;]/g, '')
    .trim();
  var foundSeperator = false;
  var index = 0;
  var addedSpace = false;

  const trimStart = () => {
    str = str.trim();
    while (
      str.startsWith('.') ||
      str.startsWith(',') ||
      str.startsWith('!') ||
      str.startsWith('”')
    )
      str = str.substring(1).trim();
    return str;
  };

  const getNext = () => {
    var r = '';
    index++;
    if (txt.length > index) r = txt[index];
    if (r == '\r' || r == '\n' || r == '"') r = 'a';
    return r;
  };

  const isClock = () => {
    let t = "";
    for (var i = index +1; i <= txt.length; i++) {
      if (txt.charAt(i).isEmptyOrSpaces() && t.length===0)
        continue
      t += txt.charAt(i);
      if (t.length>=4)
        break;
    }

    if (t.indexOf("pm")!= -1)
      console.log(t)
    return /\b(AM|PM)\b(?:\s( )\s(.)\s(\\n)\s(\\r))?/gi.test(t);
  }
  var pValue = '';

  for (var x of txt) {
    if (x == '.' && str.trim().endsWith('.') || (x == "…" && str.isEmptyOrSpaces())) {
      continue
    };

    if (str.isEmptyOrSpaces() && (x == '.' || x == '?' || x == '!' || x == ',' || x == ":"))
      continue;


    if (x !== '\r' && x !== '\n' && x !== '"') {
      if (!addedSpace || x != ' ') {
        str += x;
      }
      addedSpace = false;
    } else if (x == '\r' || x == '\n') str = str.trim() + " "


    if (x == "." && isClock()) {
      continue;
    }

    var next = getNext();
    if ((x == '.' || x == '?' || x == '!' || x == ',' || x == "”" || x == ":") && /[\p{L}|\p{N}]/giu.test(next)) {
      if ((x !== ',' && x !== '.') || (!/[\p{N}]/giu.test(pValue) || !/[\p{N}]/giu.test(next))) {
        str = str.trim() + " "
        addedSpace = true;
      }
    }
    var r = undefined;
    const seperatorsWords = [/chapter /gmi, /:/gmi, /level /gmi, / hp /gmi, /[0-9]\/[0-9]/gmi, /[0-9]\-[0-9]/gmi, /[0-9]\,[0-9]/gmi, /([ ]+[mr|Mrs|Ms|Miss]+[\.]).*/gmi, /\[|\(|\)|\]/gmi]
    if (str != "" && (r = seperatorsWords.find(a => a.test(str)))) {
      foundSeperator = true;
    }

    const reset = () => {
      foundSeperator = false;
      str = '';
      addedSpace = false;
      pValue = '';
    }


    if ((str.length >= maxCounter && ((x == '.' && next != '”') || (pValue == '.' && x == '”'))) || (foundSeperator === true && (x == '\r' || x == '\n'))
    ) {
      txtArray.push(trimStart());
      reset();
    } else pValue = x;
  }
  if (str.length > 0) {
    txtArray.push(trimStart());
  }

  return txtArray.filter(x => x !== undefined && !x.isEmptyOrSpaces());
}

String.prototype.isEmptyOrSpaces = function (): boolean {
  var str = String(this);
  return !str || str === null || str.match(/^ *$/) !== null || str.length <= 0;
}

String.prototype.defaulOnEmpty = function (defaultValue?: string): string {
  var str = String(this);
  if ((!str || str.trim().length <= 0) && !defaultValue)
    str = defaultValue ?? "";

  return str;
}

String.prototype.htmlText = function (structuredText?: boolean): string {
  var htmlOrText = String(this);
  if (!htmlOrText || htmlOrText.trim() == "")
    return "";
  var isHtml = /(<([^>]+)>)/ig
  if (!isHtml.test(htmlOrText))
    return htmlOrText.replace(/(?=&)(.*?)(;)/g, "").replace(/^[ ]+/g, '').replace(/(?:\r\n|\r|\n)/g, "").trim();
  htmlOrText = htmlOrText.replace(/h5>|h1>|h2>|h3>|h4>|h6>|li>/g, "p>");
  if (structuredText === false)
    return DomParser.parse(`<div>${htmlOrText}</div>`).documentElement.innerText().trim()?.replace(/(?=&)(.*?)(;)/g, "").replace(/^[ ]+/g, '');
  return DomParser.parse(`<div>${htmlOrText}</div>`).documentElement.text().trim()?.replace(/(?=&)(.*?)(;)/g, "").replace(/^[ ]+/g, '');
}

String.prototype.number = function (): string {
  var txt = String(this);
  return txt?.replace(/[^\d.-]/g, "") ?? "";
}

String.prototype.compine = function (...paths: string[]): string {
  var url = new String(this);
  for (var i = 0; i < paths.length; i++) {
    var str = paths[i];
    if (str.startsWith("/"))
      str = str.substring(1);
    if (str.endsWith("/"))
      str = str.substring(0, str.length - 1);

    if (url.endsWith("/"))
      url = url.substring(0, url.length - 1);

    url = url + "/" + str; // relative url
  }

  return url.toString(); // relative url
}

String.prototype.uri = function (homePage?: string | null): string {
  var url = String(this);
  if (!url || url.length <= 0)
    return String(this).toString();
  url = url.trim();
  if (url.startsWith("https") || url.startsWith("http") || url.startsWith("www"))
    return url;

  if (url.startsWith("//"))
    return "https:" + url;
  if (url.startsWith("/"))
    url = url.substring(1);
  if (homePage && homePage.endsWith("/"))
    homePage = homePage.slice(0, -1);
  return homePage + "/" + url; // relative url
}
export { };

