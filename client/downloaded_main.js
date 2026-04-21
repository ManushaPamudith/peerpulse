import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/main.jsx");import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=958f05af"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
import __vite__cjsImport2_react from "/node_modules/.vite/deps/react.js?v=958f05af"; const React = __vite__cjsImport2_react.__esModule ? __vite__cjsImport2_react.default : __vite__cjsImport2_react;
import __vite__cjsImport3_reactDom_client from "/node_modules/.vite/deps/react-dom_client.js?v=958f05af"; const ReactDOM = __vite__cjsImport3_reactDom_client.__esModule ? __vite__cjsImport3_reactDom_client.default : __vite__cjsImport3_reactDom_client;
import { BrowserRouter } from "/node_modules/.vite/deps/react-router-dom.js?v=958f05af";
import App from "/src/App.jsx";
import { AuthProvider } from "/src/context/AuthContext.jsx";
import "/src/styles/global.css?t=1774222862126";
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return /* @__PURE__ */ jsxDEV("div", { style: { padding: 40, fontFamily: "monospace" }, children: [
        /* @__PURE__ */ jsxDEV("h2", { style: { color: "red" }, children: "App crashed — check console" }, void 0, false, {
          fileName: "F:/SLIIT Life/3rd yr 1st Sem/ITPM/example2/PeerPulse_ex2/client/src/main.jsx",
          lineNumber: 18,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("pre", { style: { background: "#fee", padding: 16, borderRadius: 8, whiteSpace: "pre-wrap" }, children: [
          this.state.error.toString(),
          "\n\n",
          this.state.error.stack
        ] }, void 0, true, {
          fileName: "F:/SLIIT Life/3rd yr 1st Sem/ITPM/example2/PeerPulse_ex2/client/src/main.jsx",
          lineNumber: 19,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "F:/SLIIT Life/3rd yr 1st Sem/ITPM/example2/PeerPulse_ex2/client/src/main.jsx",
        lineNumber: 17,
        columnNumber: 9
      }, this);
    }
    return this.props.children;
  }
}
console.log("MAIN.JSX is executing!");
const rootElement = document.getElementById("root");
console.log("Root element:", rootElement);
ReactDOM.createRoot(rootElement).render(
  /* @__PURE__ */ jsxDEV(React.StrictMode, { children: /* @__PURE__ */ jsxDEV(ErrorBoundary, { children: /* @__PURE__ */ jsxDEV(BrowserRouter, { children: /* @__PURE__ */ jsxDEV(AuthProvider, { children: /* @__PURE__ */ jsxDEV(App, {}, void 0, false, {
    fileName: "F:/SLIIT Life/3rd yr 1st Sem/ITPM/example2/PeerPulse_ex2/client/src/main.jsx",
    lineNumber: 40,
    columnNumber: 11
  }, this) }, void 0, false, {
    fileName: "F:/SLIIT Life/3rd yr 1st Sem/ITPM/example2/PeerPulse_ex2/client/src/main.jsx",
    lineNumber: 39,
    columnNumber: 9
  }, this) }, void 0, false, {
    fileName: "F:/SLIIT Life/3rd yr 1st Sem/ITPM/example2/PeerPulse_ex2/client/src/main.jsx",
    lineNumber: 38,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "F:/SLIIT Life/3rd yr 1st Sem/ITPM/example2/PeerPulse_ex2/client/src/main.jsx",
    lineNumber: 37,
    columnNumber: 5
  }, this) }, void 0, false, {
    fileName: "F:/SLIIT Life/3rd yr 1st Sem/ITPM/example2/PeerPulse_ex2/client/src/main.jsx",
    lineNumber: 36,
    columnNumber: 3
  }, this)
);
if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("F:/SLIIT Life/3rd yr 1st Sem/ITPM/example2/PeerPulse_ex2/client/src/main.jsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("F:/SLIIT Life/3rd yr 1st Sem/ITPM/example2/PeerPulse_ex2/client/src/main.jsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IkFBY1U7OztBQWRWLE9BQU9BLFdBQVc7QUFDbEIsT0FBT0MsY0FBYztBQUNyQixTQUFTQyxxQkFBcUI7QUFDOUIsT0FBT0MsU0FBUztBQUNoQixTQUFTQyxvQkFBb0I7QUFDN0IsT0FBTztBQUVQLE1BQU1DLHNCQUFzQkwsTUFBTU0sVUFBVTtBQUFBLEVBQzFDQyxZQUFZQyxPQUFPO0FBQUUsVUFBTUEsS0FBSztBQUFHLFNBQUtDLFFBQVEsRUFBRUMsT0FBTyxLQUFLO0FBQUEsRUFBRztBQUFBLEVBQ2pFLE9BQU9DLHlCQUF5QkQsT0FBTztBQUFFLFdBQU8sRUFBRUEsTUFBTTtBQUFBLEVBQUc7QUFBQSxFQUMzREUsU0FBUztBQUNQLFFBQUksS0FBS0gsTUFBTUMsT0FBTztBQUNwQixhQUNFLHVCQUFDLFNBQUksT0FBTyxFQUFFRyxTQUFTLElBQUlDLFlBQVksWUFBWSxHQUNqRDtBQUFBLCtCQUFDLFFBQUcsT0FBTyxFQUFFQyxPQUFPLE1BQU0sR0FBRywyQ0FBN0I7QUFBQTtBQUFBO0FBQUE7QUFBQSxlQUF3RDtBQUFBLFFBQ3hELHVCQUFDLFNBQUksT0FBTyxFQUFFQyxZQUFZLFFBQVFILFNBQVMsSUFBSUksY0FBYyxHQUFHQyxZQUFZLFdBQVcsR0FDcEY7QUFBQSxlQUFLVCxNQUFNQyxNQUFNUyxTQUFTO0FBQUEsVUFDMUI7QUFBQSxVQUNBLEtBQUtWLE1BQU1DLE1BQU1VO0FBQUFBLGFBSHBCO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFJQTtBQUFBLFdBTkY7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQU9BO0FBQUEsSUFFSjtBQUNBLFdBQU8sS0FBS1osTUFBTWE7QUFBQUEsRUFDcEI7QUFDRjtBQUVBQyxRQUFRQyxJQUFJLHdCQUF3QjtBQUNwQyxNQUFNQyxjQUFjQyxTQUFTQyxlQUFlLE1BQU07QUFDbERKLFFBQVFDLElBQUksaUJBQWlCQyxXQUFXO0FBRXhDdkIsU0FBUzBCLFdBQVdILFdBQVcsRUFBRVo7QUFBQUEsRUFDL0IsdUJBQUMsTUFBTSxZQUFOLEVBQ0MsaUNBQUMsaUJBQ0MsaUNBQUMsaUJBQ0MsaUNBQUMsZ0JBQ0MsaUNBQUMsU0FBRDtBQUFBO0FBQUE7QUFBQTtBQUFBLFNBQUksS0FETjtBQUFBO0FBQUE7QUFBQTtBQUFBLFNBRUEsS0FIRjtBQUFBO0FBQUE7QUFBQTtBQUFBLFNBSUEsS0FMRjtBQUFBO0FBQUE7QUFBQTtBQUFBLFNBTUEsS0FQRjtBQUFBO0FBQUE7QUFBQTtBQUFBLFNBUUE7QUFDRiIsIm5hbWVzIjpbIlJlYWN0IiwiUmVhY3RET00iLCJCcm93c2VyUm91dGVyIiwiQXBwIiwiQXV0aFByb3ZpZGVyIiwiRXJyb3JCb3VuZGFyeSIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJzdGF0ZSIsImVycm9yIiwiZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yIiwicmVuZGVyIiwicGFkZGluZyIsImZvbnRGYW1pbHkiLCJjb2xvciIsImJhY2tncm91bmQiLCJib3JkZXJSYWRpdXMiLCJ3aGl0ZVNwYWNlIiwidG9TdHJpbmciLCJzdGFjayIsImNoaWxkcmVuIiwiY29uc29sZSIsImxvZyIsInJvb3RFbGVtZW50IiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImNyZWF0ZVJvb3QiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZXMiOlsibWFpbi5qc3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20vY2xpZW50JztcbmltcG9ydCB7IEJyb3dzZXJSb3V0ZXIgfSBmcm9tICdyZWFjdC1yb3V0ZXItZG9tJztcbmltcG9ydCBBcHAgZnJvbSAnLi9BcHAnO1xuaW1wb3J0IHsgQXV0aFByb3ZpZGVyIH0gZnJvbSAnLi9jb250ZXh0L0F1dGhDb250ZXh0JztcbmltcG9ydCAnLi9zdHlsZXMvZ2xvYmFsLmNzcyc7XG5cbmNsYXNzIEVycm9yQm91bmRhcnkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBjb25zdHJ1Y3Rvcihwcm9wcykgeyBzdXBlcihwcm9wcyk7IHRoaXMuc3RhdGUgPSB7IGVycm9yOiBudWxsIH07IH1cbiAgc3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21FcnJvcihlcnJvcikgeyByZXR1cm4geyBlcnJvciB9OyB9XG4gIHJlbmRlcigpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5lcnJvcikge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBzdHlsZT17eyBwYWRkaW5nOiA0MCwgZm9udEZhbWlseTogJ21vbm9zcGFjZScgfX0+XG4gICAgICAgICAgPGgyIHN0eWxlPXt7IGNvbG9yOiAncmVkJyB9fT5BcHAgY3Jhc2hlZCDigJQgY2hlY2sgY29uc29sZTwvaDI+XG4gICAgICAgICAgPHByZSBzdHlsZT17eyBiYWNrZ3JvdW5kOiAnI2ZlZScsIHBhZGRpbmc6IDE2LCBib3JkZXJSYWRpdXM6IDgsIHdoaXRlU3BhY2U6ICdwcmUtd3JhcCcgfX0+XG4gICAgICAgICAgICB7dGhpcy5zdGF0ZS5lcnJvci50b1N0cmluZygpfVxuICAgICAgICAgICAgeydcXG5cXG4nfVxuICAgICAgICAgICAge3RoaXMuc3RhdGUuZXJyb3Iuc3RhY2t9XG4gICAgICAgICAgPC9wcmU+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuY2hpbGRyZW47XG4gIH1cbn1cblxuY29uc29sZS5sb2coJ01BSU4uSlNYIGlzIGV4ZWN1dGluZyEnKTtcbmNvbnN0IHJvb3RFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb3QnKTtcbmNvbnNvbGUubG9nKCdSb290IGVsZW1lbnQ6Jywgcm9vdEVsZW1lbnQpO1xuXG5SZWFjdERPTS5jcmVhdGVSb290KHJvb3RFbGVtZW50KS5yZW5kZXIoXG4gIDxSZWFjdC5TdHJpY3RNb2RlPlxuICAgIDxFcnJvckJvdW5kYXJ5PlxuICAgICAgPEJyb3dzZXJSb3V0ZXI+XG4gICAgICAgIDxBdXRoUHJvdmlkZXI+XG4gICAgICAgICAgPEFwcCAvPlxuICAgICAgICA8L0F1dGhQcm92aWRlcj5cbiAgICAgIDwvQnJvd3NlclJvdXRlcj5cbiAgICA8L0Vycm9yQm91bmRhcnk+XG4gIDwvUmVhY3QuU3RyaWN0TW9kZT5cbik7XG4iXSwiZmlsZSI6IkY6L1NMSUlUIExpZmUvM3JkIHlyIDFzdCBTZW0vSVRQTS9leGFtcGxlMi9QZWVyUHVsc2VfZXgyL2NsaWVudC9zcmMvbWFpbi5qc3gifQ==