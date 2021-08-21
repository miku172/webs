import "./App.css";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack";
import React, { useRef } from "react";

let div = null; // 渲染的控件
let position = []; // [x,y] 鼠标点击位置距离点击元素顶点的距离
let srcPosition = []; // 记录鼠标点击位置距离点击元素的偏移
let currentPage = -1; // 记录当前控件所在的页码
let currentElement = null; // 目标控件
const pageNumber = [0, 1, 2,3,4,5,6]; // 页码列表
export default function App() {
  const LRef = useRef({});
  const DRef = useRef({});
  // 鼠标按下
  // @ts-ignore
  const onMouseDown = (event) => {
     // 生成渲染的控件
     div = document.createElement("div");
     div.key = Math.random();
     div.draggable = true;
     div.style.width = "150px";
     div.style.height = "100px";
     div.style.backgroundColor = "none";
     div.style.position = "absolute";
     div.style.left = 0 + "px";
     div.style.top = 0 + "px";
     div.style.zIndex = "5555";
     div.style.opacity = 0;
     div.ondragstart = onDragStart;
     div.ondragend = onDragEnd;
     div.ondragover = (event) => event.preventDefault();
     LRef.current?.appendChild(div);
     position = [event.pageX, event.pageY];
  };
  // 拖拽开始
  const onDragStart = (event) => {
    if(div === null){
      div = event.target;
    }
    srcPosition = [
      // @ts-ignore
      event.current?.offsetLeft || 0,
      // @ts-ignore
      event.current?.offsetTop || 0,
    ];
    div.style.backgroundColor = "red";
    div.style.opacity = 0.5;
  };
  // 拖拽结束
  const onDragEnd = (event) => {
    if(!currentElement) return;
    if(div === null) return console.warn(div);
    // x轴坐标
    div.style.left = event.pageX - position[0] - parseFloat(div.style.width) - srcPosition[0] + "px";
    // y轴坐标
    const OH = currentElement?.clientHeight || 0; // 当前页的高度
    // @ts-ignore
    const ST = DRef.current?.scrollTop || 0; // 滚动条的位置
    // 滚动条的距离 - （ 当前页码 - 1 ） * 页面的高度  , 插值
    let c =  ST- (currentPage - 1) * OH;
    div.style.top = event.pageY + c - position[1] - srcPosition[1] + "px";
    // 渲染控件到图像上
    currentElement?.parentNode?.appendChild(div);
    console.log(`当前的页码：${currentPage};控件距离当前页面的absolute坐标[x,y]: [${div.style.left},${div.style.top}]`);
    div = null;
  };
  // 拖拽进入事件
  const onDragEnter = (event, page) => {
    event.preventDefault();
    currentPage = page;
    const dl = document.querySelectorAll(".ContentPage");
    let ce = null;
    for(let item of dl){
      if("" + item.getAttribute("data-page-number") === "" + page){
        ce = item;
        break;
      }
    }
    if(ce){
      currentElement = ce.children[0]; // 获取canvas对象
    }
  };
  // 拖拽离开事件
  const onDragLeave = (event) => {
    event.preventDefault();
  };
  // 文档加载
  const onLoadSuccess = ({ numPages }) => {
    console.log("页码数:"+numPages);
  };
  return (
    <div className="App">
      <div className="LeftSide">
        <div
          // @ts-ignore
          ref={LRef}
          className="LeftItem"
          onMouseDown={onMouseDown}
        >
          控件
        </div>
      </div>
      <div className="RightSide">
        <Document
          file={{ url: "https://www.gjtool.cn/pdfh5/git.pdf" }}
          onLoadSuccess={onLoadSuccess}
          className="Document"
          // @ts-ignore
          inputRef={DRef}
        >
          {pageNumber.map(
            (
              item,
              index
            ) => (
              <div
                key={index}
                onDragEnter={(event) => onDragEnter(event, index + 1)}
                onDragLeave={onDragLeave}
                // @ts-ignore
                page={index + 1}
              >
                <Page pageNumber={index + 1} className={"ContentPage"} renderAnnotationLayer={false} renderTextLayer={false} />
              </div>
            )
          )}
        </Document>
      </div>
    </div>
  );
}
