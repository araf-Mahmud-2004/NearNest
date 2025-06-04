import{c as s}from"./index-ChpuFEIP.js";import{j as e}from"./ui-JykPZCXU.js";import{a as t}from"./vendor-o8UMtg5z.js";import{C as o,b as c,c as i,a as n}from"./card-BY5eXOcl.js";import{B as d}from"./input-djnnCoEv.js";import{C as h}from"./timeUtils-byEPStRZ.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=s("ExternalLink",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=s("RefreshCw",[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=s("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]]);class j extends t.Component{constructor(r){super(r),this.state={hasError:!1}}static getDerivedStateFromError(r){return{hasError:!0,error:r}}componentDidCatch(r,a){console.error("Error caught by boundary:",r,a)}render(){return this.state.hasError?this.props.fallback?this.props.fallback:e.jsxs(o,{className:"max-w-md mx-auto mt-8",children:[e.jsx(c,{children:e.jsxs(i,{className:"flex items-center gap-2 text-destructive",children:[e.jsx(h,{className:"h-5 w-5"}),"Something went wrong"]})}),e.jsxs(n,{className:"space-y-4",children:[e.jsx("p",{className:"text-sm text-muted-foreground",children:"This component encountered an error. This might be due to missing database tables or configuration issues."}),this.state.error&&e.jsxs("details",{className:"text-xs text-muted-foreground",children:[e.jsx("summary",{className:"cursor-pointer",children:"Error details"}),e.jsx("pre",{className:"mt-2 p-2 bg-muted rounded text-xs overflow-auto",children:this.state.error.message})]}),e.jsxs(d,{onClick:()=>{this.setState({hasError:!1,error:void 0}),window.location.reload()},className:"w-full",children:[e.jsx(l,{className:"h-4 w-4 mr-2"}),"Reload Page"]})]})]}):this.props.children}}export{g as E,l as R,v as U,j as a};
