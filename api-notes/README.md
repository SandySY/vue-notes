---
# 主题列表：juejin, github, smartblue, cyanosis, channing-cyan, fancy, hydrogen, condensed-night-purple, greenwillow, v-green, vue-pro, healer-readable, mk-cute, jzman, geek-black, awesome-green, qklhk-chocolate
# 贡献主题：https://github.com/xitu/juejin-markdown-themes
theme: greenwillow
highlight:
---
![image](https://github.com/SandySY/vue-notes/static/images/logo.jpg)
![image](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6a39dcc1963742dda40858bdb133ac84~tplv-k3u1fbpfcp-watermark.image)

# Vue 常用 API、高级 API

> 最近手痒痒，玩儿了一下 Vue3.0，很舒服，赶紧把这几期 Vue2.0 弄完，写一些 3.0 的东西。
> 本文主要罗列和解析一些个人认为常用或有大用途的 Api，作为自我总结的笔记和探讨。

## nextTick

---

**功能：** 添加在下次 Dom 更新循环结束之后的延迟回调，修改数据之后，可以获取更新后的 Dom。  
**用法：**

```js
Vue.nextTick([callback, context]);
vm.$nextTick([callback]);
// 用法2
// 作为一个 Promise 使用 (2.1.0 起新增)
Vue.nextTick().then(function () {
  // DOM 更新了
});
```

**说明：**

- callback：延迟回调函数
- context：可选的 object  
  ps：2.1.0 起新增：如果没有提供回调且在支持 Promise 的环境中，则返回一个 Promise。请注意 Vue 不自带 Promise 的 polyfill，所以如果你的目标浏览器不原生支持 Promise (IE：你们都看我干嘛)，你得自己提供 polyfill。

> 扩展： 关于 nextTick 的执行机制和使用场景，我们还必须掌握类似的 requestAnimationFrame() 和 process.nextTick()， 前者是浏览器自带的监听（在下次重绘之前执行），后者是 node 环境下，在下一个事件轮询的时间点上执行。

## mixin

---

**功能：** 注册一个混入，影响注册之后所有创建的每个 Vue 实例。插件作者可以使用混入，向组件注入自定义的行为。  
**用法：**

```js
// 为自定义的选项 'myOption' 注入一个处理器。
Vue.mixin({
  created: function () {
    var myOption = this.$options.myOption;
    if (myOption) {
      console.log(myOption);
    }
  },
});

new Vue({
  myOption: "hello!",
});
// => "hello!"
```

**说明：**

- object：一个 vm 的属性或方法  
  ps：请谨慎使用全局混入，因为它会影响每个单独创建的 Vue 实例 (包括第三方组件)。大多数情况下，只应当应用于自定义选项，就像上面示例一样。推荐将其作为插件发布，以避免重复应用混入。

## $forceUpdate

---

**功能：** 迫使 Vue 实例重新渲染。  
**用法：**

```js
vm.$forceUpdate();
```

**说明：** 注意它仅仅影响实例本身和插入插槽内容的子组件，而不是所有子组件。

## set、delete

---

**功能：** 对响应式数据的属性进行设置、删除，同时触发视图更新。  
**用法：**

```js
// 用法1
Vue.set(target, key, value);
Vue.delete(target, key);
// 用法2
vm.$set(target, key, value);
vm.$delete(target, key);
```

**说明：**

- target：目标对象
- key：要添加的属性名
- value：要添加的属性值  
  ps：主要使用场景，可以避开 Vue 不能检测到 property 被删除的限制

## filter

---

**功能：** 用于一些常见的文本格式化和一些规范数据 mapping。  
**用法：**

```html
<!-- 在双花括号中 -->
{{ message | capitalize }}

<!-- 在 `v-bind` 中 -->
<div v-bind:id="rawId | formatId"></div>
```

```js
// 注册
filters: {
  capitalize: function (value) {
    if (!value) return ''
    value = value.toString()
    return value.charAt(0).toUpperCase() + value.slice(1)
  }
}
```

```js
// 全局注册
Vue.filter("capitalize", function (value) {
  if (!value) return "";
  value = value.toString();
  return value.charAt(0).toUpperCase() + value.slice(1);
});

new Vue({
  // ...
});
```

**说明：**

- 过滤器函数总接收表达式的值 (之前的操作链的结果) 作为第一个参数。
- 过滤器应该被添加在 JavaScript 表达式的尾部，由“管道”符号指示。
  > ps：过滤器可以接受多个参数，如{{ message | filterA('arg1', arg2) }}，这里，filterA 被定义为接收三个参数的过滤器函数。其中 message 的值作为第一个参数，普通字符串 'arg1' 作为第二个参数，表达式 arg2 的值作为第三个参数。

## directive

---

**功能：** 用于注册自定义指令。  
**用法：**

```html
<!-- 当页面加载时，该元素将获得焦点 -->
<input v-focus />
```

```js
// 注册一个全局自定义指令 `v-focus`
Vue.directive("focus", {
  // 当被绑定的元素插入到 DOM 中时……
  inserted: function (el) {
    // 聚焦元素
    el.focus();
  },
});
```

```js
// 注册局部指令，组件中也接受一个 directives 的选项
directives: {
  focus: {
    // 指令的定义
    inserted: function (el) {
      el.focus()
    }
  }
}
```

**说明：**

- inserted 只是注册指令的其中一个插值函数，完整的注册属性还可以包括：
  - bind：只调用一次，指令第一次绑定到元素时调用，在这里可以进行一次性的初始化设置。
    - inserted：被绑定元素插入父节点时调用（仅保证父节点存在，但不一定已被插入文档中）。
    - update：所在组件的 VNode 更新时调用，但是可能发生在其子 VNode 更新之前。指令的值可能发生了改变，也可能没有，但是可以通过比较更新前后的值来忽略不必要的模板更新。
    - componentUpdated：指令所在组件的 VNode 及其子 VNode 全部更新后调用。
    - unbind：只调用一次，指令与元素解绑时调用。

```js
Vue.directive("my-directive", {
  bind: function () {},
  inserted: function () {},
  update: function () {},
  componentUpdated: function () {},
  unbind: function () {},
});
```

## 其它简单的常用属性和方法

```js
// console.log(vm.$root);
vm.$root    //实例对象

vm.$el  //根元素（真实的DOM元素）
// console.log(vm.$el);

vm.$el.innerHTML    //得到根元素（真实的DOM元素）中的内容
// console.log(vm.$el.innerHTML);

vm.$data    //实例下的data对象
// console.log(vm.$data);

vm.$options     //实例下的挂载项
// console.log(vm.$options);

vm.$props   //组件之间通信的数据
// console.log(vm.$props);

vm.$parent      //在组件中，指父元素
// console.log(vm.$parent);

vm.$children    //在组件中，指子代元素
// console.log(vm.$children);

vm.$attrs   //用来获取父组件传递过来的所有属性
// console.log(vm.$attrs);

vm.$listeners   //用来获取父组件传递过来的所有方法
// console.log(vm.$listeners);

vm.$slots   //组件中的插槽
// console.log(vm.$slots);

vm.$scopedSlots     //用来访问作用域插槽
// console.log(vm.$scopedSlots);

vm.$refs    //用来定位DOM元素（使用ref进行追踪）
// console.log(vm.$refs);

vm.$watch   //用于监听数据（在vue文件中使用后会自动销毁）
// console.log(vm.$watch);

vm.$emit    //用于派发事件（常用于数据通信）
// console.log(vm.$emit);

vm.$on  //用于监听事件的派发
// console.log(vm.$on);

vm.$once    //只监听事件一次（之后不监听）
// console.log(vm.$once);

//生命周期
beforeCreate() {
}
created() {
}
beforeMount() {
}
mounted() {
}
beforeUpdate() {
}
updated() {
}
beforeDestroy() {
}
destroyed() {
}
```

## 总结

本文主要收录 vue 中常用的这几个 API，如果有兴趣学习更多，可以参考其官网。希望本文对你有用，并能熟练运用到实际的项目开发中。

> 为了方便阅读理解，本文代码已经上传[Github](https://github.com/SandySY/vue-notes)

文中如有错误，欢迎在评论区指正，如果有所帮助，欢迎点赞和关注。
