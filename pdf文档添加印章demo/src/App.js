import "./App.css";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack";
import React, { useRef } from "react";
/**
 * ie8及更早版本不支持
 */
let div = null; // 渲染的控件
let position = []; // [x,y] 鼠标点击位置距离点击元素顶点的距离
let srcPosition = []; // [x, y] 鼠标点击位置相对于点击元素的偏移量
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
     div.onmousedown = onMouseDown2;
     div.ondragstart = onDragStart;
     div.ondragend = onDragEnd;
     div.ondrag = onDrag;
     LRef.current?.appendChild(div);
     position = [event.pageX, event.pageY];
     srcPosition = [LRef.current?.offsetLeft || 0, LRef.current?.offsetTop || 0];
  };
  // 鼠标释放事件
  const onMouseUp = (event)=>{
    try {
      LRef.current?.removeChild(div);
    } catch (error) {}
  }
  // 拖拽元素的点击事件
  const onMouseDown2 = (event) => {
    if(position[0] === 0){
      srcPosition = [event?.offsetX || 0, event?.offsetY || 0];
    }
  }
  // 拖拽开始
  const onDragStart = (event) => {
    if(div === null){
      div = event.target;
    }
    div.style.backgroundColor = "red";
    div.style.opacity = 0.5;
  };
  // 拖拽结束
  const onDragEnd = (event) => {
    
    if(!currentElement) return onMouseUp(null);
    if(div === null) return console.warn(div);
    const DOL = DRef.current?.offsetLeft || 0; // 文档区域的左偏移量
    const DOT = DRef.current?.offsetTop || 0; // 文档区域的上偏移量
    const OW = currentElement?.clientWidth || 0; // 当前页的宽度
    const OH = currentElement?.clientHeight || 0; // 当前页的高度
    const ST = DRef.current?.scrollTop || 0; // 滚动条的位置
    // 滚动条的距离 - （ 当前页码 - 1 ） * 页面的高度  , 插值
    const C =  ST- (currentPage - 1) * OH;
    // x轴坐标
    div.style.left = event.pageX - DOL - srcPosition[0] + "px";
    // 判断是否超出左右边界
    if(parseFloat(div.style.left) < 0){ // 左边界判断
      div.style.left = 0 + "px";
    }
    if(parseFloat(div.style.left) + parseFloat(div.style.width) > OW){ // 右边界判断
      div.style.left = OW - parseFloat(div.style.width) + "px";
    }
    // y轴坐标
    const NS = event.pageY - DOT - srcPosition[1]; 
    div.style.top = C + NS + "px";
    // // 判断是否超出上下边界
    if(parseFloat(div.style.top) < 0){ // 超出上边界
      div.style.top = 0 + "px";
    }
    if(parseFloat(div.style.top) + parseFloat(div.style.height) > OH){ // 超出下边界
      div.style.top = OH - parseFloat(div.style.height) + "px";
    }
    // 渲染控件到图像上
    currentElement?.parentNode?.appendChild(div);
    console.log(`当前的页码：${currentPage};控件距离当前页面的absolute坐标[x,y]: [${div.style.left},${div.style.top}]`);
    onMouseUp(null);
    div = null;
    position = [0, 0];
  };
  // 拖拽事件
  const onDrag = (event)=>{
    // console.log(event);
  }
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
  // 在拖拽容器范围内
  const onDragOver = (event) => {
    event.preventDefault();
  };
  // 鼠标释放事件
  const onDrop = (event)=>{
    event.preventDefault();
  }
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
          onMouseUp={onMouseUp}
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
                onDragOver={onDragOver}
                onDrop={onDrop}
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
