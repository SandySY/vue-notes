---
# 主题列表：juejin, github, smartblue, cyanosis, channing-cyan, fancy, hydrogen, condensed-night-purple, greenwillow, v-green, vue-pro, healer-readable, mk-cute, jzman, geek-black, awesome-green, qklhk-chocolate
# 贡献主题：https://github.com/xitu/juejin-markdown-themes
theme: vue-pro
highlight:
---
![image](https://github.com/SandySY/vue-notes/static/images/example0.jpg)
## 默写 Vue-Router

### 写在前面

> 作为国内使用最多的库之一的 Vue，大家都在学习其源码，做到知其然而知其所以然；  
> 因为我们不仅要懂得如何使用它，还得了解其原理或者怎么模拟实现;  
> 但是光看可不行，咱们还得动手，一遍不行就两遍，两遍不行就三遍...  
> 谁也不是天才，一用就会，一问就懵，那今天从默写实现 Vue-router 开始，删繁就简，手写 vue-router 核心源码。

### 路由的源头

> > 路由经历了从多页面应用到单页面应用的发展，最开始的网页是多页面的，一个完整的网页应用有多个完整的 html 构成，通过 a 标签对应到不同 url，服务器端来根据 URL 的不同返回不同的页面，那些页面在服务端都是实实在在存在的。

> > 我毕业参加工作是 2014 年，这个时候前端能做的事情很有限，前后端还不能完全分离，依赖于 Ajax ，使得前端能够胜任更多更复杂的事，前后端的职责越来越清晰，在业务不断发展的过程中，由于前端项目变得越来越复杂，所以我们要考虑拆分出前端应用部分，使之成为一个能独立开发、运行的应用，而非依赖于后端渲染出 HTML 的多页面应用。单页面应用就应运而生了。

> > 单页面应用就是一个 WEB 项目只有一个 HTML 页面，一旦页面加载完成，SPA 不会因为用户的操作而进行页面的重新加载或跳转。 取而代之的是利用 JS 动态的变换 HTML 的内容，从而来模拟多个视图间跳转。
> > 说到底路由是根据不同的 URL 来展示不同的内容或页面，而路由的本质 就是建立起 url 和页面之间的映射关系。

> > 大部分单页面应用的架构都是为响应式 Dom 铺路，我们都知道常规的 Dom 操作开销太大，尤其是在各个板块有大量数据交互和用户 IO 交互场景的时候。单页面应用就是在一个 Public 的 Html 架子上，进行虚拟 Dom 的展示和响应式数据模型的运用，让一切看起来都在观察者的监视下运行着，借助路由展示着不同的模板内容。

### 路由模式 Hash 和 History

**Hash 模式**使用了浏览器 URL 后缀中的#xxx 部分来实现前端路由。默认情况下，URL 后缀中的#xxx hash 部分是用来做网页的锚点功能的，现在前端路由看上了这个点，并对其加以利用。
比如这个 URL：http://www.abc.com/#/hello，hash 的值为 #/hello。
为什么会看上浏览器 URL 后缀中的 hash 部分呢？原因也简单：

浏览器 URL 后缀中的 hash 改变了，不会触发请求，对服务器完全没有影响。它的改变不会重新加载浏览器页面。
更关键的一点是，因为 hash 发生变化的 url 都会被浏览器记录下来，从而你会发现浏览器的前进后退都可以用了，页面的状态与浏览器的 URL 就发生了挂钩。

> 大白话： hash 模式不会真实跳转，留心观察浏览器加载状态并无变化，监听背后的原理是 onhashchange 事件而已。

**History 路由模式**

> > 随着 HTML5 中 history api 的到来，前端路由开始进化了。hashchange 只能改变 # 后面的代码片段，history api （pushState、replaceState、go、back、forward） 则给了前端完全的自由。
> > 在 HTML5 之前，浏览器就已经有了 history 对象。但在早期的 history 中只能用于多页面的跳转，正如早期我们编写路由时，总会用到如下 api 控制页面跳转。

```js
history.go(-1); // 后退一页
history.go(2); // 前进两页
history.forward(); // 前进一页
history.back(); // 后退一页
//Html5 新增
history.pushState(); // 添加新的状态到历史状态栈
history.replaceState(); // 用新的状态代替当前状态
history.state; // 返回当前状态对象
```

> > 大白话：通常在单页面使用中是需要后台配置 nginx 跳转支持的，试想当用户在浏览器直接访问 oursite.com/user/id，默认会由服务器检索这个文件，检索不到就会返回 404；还有另一个使用场景：SSR 的服务端渲染项目中，资料挺多，具体大家可以查一下，当前最火的一些衍生生态库 next 和 nuxt 都很好的诠释了这个特点，但是我们今天不展开 history 模式，就默写最简单的核心代码来实现路由。

### 默想是怎么使用的 Vue-Router

VueRouter 是作为插件的形式引入到 Vue 系统内部的。而将具体的 router 信息嵌入到每个 Vue 实例中，则是作为 Vue 的构造函数参数传入。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>今天进步了吗？</title>
    <script src="https://unpkg.com/vue/dist/vue.js"></script>
    <!-- <script src="https://unpkg.com/vue-router/dist/vue-router.js"></script> -->
    <script src="./vue-router-recode.js"></script>
  </head>
  <body>
    <div id="app">
      <h1>手写<strong>Vue-Router</strong></h1>
      <p>
        <!-- 使用 router-link 组件来导航. -->
        <!-- 通过传入 `to` 属性指定链接. -->
        <!-- <router-link> 默认会被渲染成一个 `<a>` 标签 -->
        <router-link to="/foo">Go to Foo</router-link>
        <router-link to="/bar">Go to Bar</router-link>
      </p>
      <!-- 路由出口 -->
      <!-- 路由匹配到的组件将渲染在这里 -->
      <router-view></router-view>
    </div>
    <script>
      // 0. 如果使用模块化机制编程，导入Vue和VueRouter，要调用 Vue.use(VueRouter)

      // 1. 定义 (路由) 组件。
      // 可以从其他文件 import 进来
      const Foo = { template: '<div>foo</div>' };
      const Bar = { template: '<div>bar</div>' };

      // 2. 定义路由
      // 每个路由应该映射一个组件。 其中"component" 可以是
      // 通过 Vue.extend() 创建的组件构造器，
      // 或者，只是一个组件配置对象。
      // 我们晚点再讨论嵌套路由。
      const routes = [
        { path: '/foo', component: Foo },
        { path: '/bar', component: Bar },
      ];

      // 3. 创建 router 实例，然后传 `routes` 配置
      // 你还可以传别的配置参数, 不过先这么简单着吧。
      const router = new VueRouter({
        routes, // (缩写) 相当于 routes: routes
      });

      // 4. 创建和挂载根实例。
      // 记得要通过 router 配置参数注入路由，
      // 从而让整个应用都有路由功能
      const vm = new Vue({
        router,
      }).$mount('#app');

      // 现在，应用已经启动了！
    </script>
  </body>
</html>
```

直接使用 router-link 和 router-view 这两个组件。它们是随着 Vue Router 一起引入的，作为全局组件使用。有了以上的想法，我们构建了这样的简单页面，接下来我们就手写一个 vue-router-recode.js 用于替换 vue-router.js 的职能。

### 常规操作：wiki 书写功能逻辑和实现思路

> 就从业这些年的经验来讲，一般开发功能或者自己造轮子的时候，合格的开发者都有着自己的一套体系，像什么 Markdown 记录笔记啊，代码良好的 md 说明文件啊，还有些画图的使用 Xmind 或流程图 ProcessOn 之类的，都可以，不局限方法，但是得有该有的习惯，否则哪天老板让写个工具，写完给别人使用还得手把手传给别人，那可太痛苦了。

> > 基本原理图：![image](https://github.com/SandySY/vue-notes/static/images/example1.jpg)

> > 完整实现思路图：![image](https://github.com/SandySY/vue-notes/static/images/example2.jpg)

### 简单版代码默写（快写 hash，一个文件干完）

对，干就完了！  
完整浏览了以上思路的，都不是难事儿，手敲速度慢的，建议多敲多写。Open with Live Server 运行完美，直接上代码：

```js
let _Vue;
class VueRouter {
  constructor({ routes }) {
    let routerMap = {};
    routes.forEach((route) => {
      let path = route.path;
      if (!routerMap[path]) {
        routerMap[path] = route;
      }
    });
    this.routerMap = routerMap;
    console.log(this.routerMap);
    //TODO
    this.current = {
      path: '',
      component: {
        template: `<div>default</div> `,
      },
    };
    this.linstener();
  }
  linstener() {
    window.addEventListener('load', () => {
      debugger;
      console.log('load');
      let hash = window.location.hash;
      if (!hash) {
        window.location.hash = '/';
      }
      let route = this.search(hash.slice(1));
      if (route) {
        this.current.path = route.path;
        this.current.component = route.component;
      }
    });
    window.addEventListener('hashchange', () => {
      debugger;
      console.log('hashchange');
      let hash = window.location.hash;
      let route = this.search(hash.slice(1));
      if (route) {
        this.current.path = route.path;
        this.current.component = route.component;
      }
    });
  }
  search(path) {
    if (this.routerMap[path]) {
      return this.routerMap[path];
    }
  }
}

VueRouter.install = function (Vue, options) {
  _Vue = Vue;
  _Vue.mixin({
    beforeCreate() {
      let vm = this;
      // console.log(vm);
      if (vm.$options.router) {
        vm._routerRoot = this;
        vm._router = vm.$options.router;
        //定义响应式数据
        _Vue.util.defineReactive(vm, '_route', vm._router.current);
      } else {
        vm._routerRoot = vm.$parent && vm.$parent._routerRoot;
      }
    },
  });
  _Vue.component('router-link', {
    props: {
      to: String,
    },
    render(c) {
      // h => createElement
      return c('a', { attrs: { href: '#' + this.to } }, this.$slots.default);
    },
  });
  _Vue.component('router-view', {
    render(c) {
      debugger;
      let component = this._routerRoot._route.component;
      return c(component);
    },
  });
};

if (typeof Vue !== 'undefined') {
  Vue.use(VueRouter);
}
```

### 总结

本文主要为理解 vueRouter 源码提供一个最基础的框架和思路，如需要对 vue 生态有着较为深入的理解，如 vue 的插件机制，vue 的双向绑定原理，后端路由和前端路由，hash 模式相关 api 以及 history 模式相关 api，更多相关的 Vue-Router 的细节，可以参考其官网。希望本文对你有用。

> 几点关键之处：
>
> - 自定义插件内部必须实现一个 install 方法，传入参数是 Vue 的构造函数。
> - 使用了一个新的 Vue 实例，将 URL 的 hash 变量进行数据响应化处理。
> - util.defineReactive 属于 Vue 源码中提供的自有方法，就是用于创建响应式数据。
> - 关于渲染函数 render 的参数 c，它实际上是 createElement 函数。

为了方便阅读理解，本文代码已经上传[Github](https://github.com/SandySY/vue-notes)  
文中如有错误，欢迎在评论区指正，如果有所帮助，欢迎点赞和关注
