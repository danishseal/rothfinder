import{_ as p,a as f}from"./-dNz_xbJ.js";import{a8 as h,p as w,ae as y,g as b,a4 as t,f as l,j as r,af as v,e as c,a7 as M,a as $,N as u,b as i}from"./BarqSwx_.js";const k={key:0,ref:"main"},T=["innerHTML"],x={key:0,class:"article bullets has-text-links-multi w-full"},C=["innerHTML"],S={__name:"[slug]",async setup(H){let s,a;const _=h().params.slug,m=w`
  query ($slug: String!) {
    legal(filter: { slug: { eq: $slug } }) {
      seo: _seoMetaTags {
        attributes
        content
        tag
      }
      title
      slug
      _updatedAt
      content
    }
  }
`,{data:n}=([s,a]=y(()=>M(m,{variables:{slug:_}})),s=await s,a(),s),e=$(()=>n.value?.legal||{});if(!n.value.legal)throw b({statusCode:404,statusMessage:"Page not found"});return(o,N)=>{const d=p,g=f;return t(e)?(u(),l("div",k,[r(d,{data:t(e)?.seo},null,8,["data"]),r(g,{class:"[&_.inner-wrap]:max-w-post s:pt-80 pt-[13.2rem]"},{default:v(()=>[i("h1",{class:"h1 s:mb-25 mb-15",innerHTML:o.$sanitize(t(e).title)},null,8,T),t(e).content?(u(),l("div",x,[i("div",{innerHTML:o.$sanitize(t(e).content)},null,8,C)])):c("",!0)]),_:1})],512)):c("",!0)}}};export{S as default};
