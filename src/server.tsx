// import * as fs from "fs";
import * as fs from "fs";
import * as http from "http";
import * as path from "path";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as url from "url";
import { getHtmlTemplate } from "./htmlTemplate";
import { App, AppProps, makeProps } from "./index";
import { AnchorProps, makeAnchorList } from "./menu";
import { makeChain, Package } from "./parser";
import { TreeData } from "./types";

export class Server {
  private app: http.Server;
  private filePath: string;

  constructor(private basePath: string, inputFile: string) {
    this.filePath = path.join(basePath, inputFile);
    this.app = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
      // TODO expressならもう少し簡単にかけそう
      let startKey: string = "Please set Query Params `?start=any`";
      if (req.url) {
        const { pathname, query } = url.parse(req.url, true);
        if (query && query.start && typeof query.start === "string") {
          startKey = query.start;
        }
        if (pathname && pathname.match(/^\/dist\//) && this.loadDistDirectoryFile(res, pathname)) {
          return;
        }
      }
      const pkg = this.getPackageJson();
      const hostname = req.headers.host;
      const anchors: AnchorProps[] = Object.keys(pkg.scripts).map(key => ({
        text: key,
        href: `http://${hostname}/?start=${key}`,
      }));
      if (!(startKey in pkg.scripts)) {
        const menu = renderToStaticMarkup(makeAnchorList(anchors));
        res.write(getHtmlTemplate(menu));
        res.end();
        return;
      }
      const chainData: TreeData = {
        name: startKey,
        children: [],
      };
      makeChain(chainData, pkg);
      const props: AppProps = makeProps(chainData, { width: 350, height: 300 }, anchors);
      const html = renderToStaticMarkup(<App {...props} />);
      res.write(getHtmlTemplate(html));
      res.end();
    });
  }

  public async run(port: number): Promise<string> {
    try {
      const server = await this.app.listen(port);
      const addr = server.address();
      if (typeof addr === "string") {
        return `http://localhost:${addr}/`;
      } else {
        return `http://localhost:${addr.port}/`;
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  private loadDistDirectoryFile(res: http.ServerResponse, pathname: string): boolean {
    const distFilePath = path.join(this.basePath, pathname);
    if (fs.existsSync(distFilePath) && fs.statSync(distFilePath).isFile()) {
      fs.createReadStream(distFilePath).pipe(res);
      return true;
    }
    return false;
  }

  private getPackageJson(): Package {
    return require(this.filePath);
  }
}
