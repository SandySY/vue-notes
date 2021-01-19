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

/**
 *
 *
 *
 */
