---
# 主题列表：juejin, github, smartblue, cyanosis, channing-cyan, fancy, hydrogen, condensed-night-purple, greenwillow, v-green, vue-pro, healer-readable, mk-cute, jzman, geek-black, awesome-green, qklhk-chocolate
# 贡献主题：https://github.com/xitu/juejin-markdown-themes
theme: vue-pro
highlight:
---

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7fd6781a83df4d95b7c7f76e4babaffd~tplv-k3u1fbpfcp-watermark.image)

## 前言

Vue3.0 在去年 9 月正式发布了，看大家都有在热情的拥抱 Vue3.0。今年初新项目也开始使用 Vue3.0 来开发，这篇文章就是在使用后的一个总结， 包含 Vue3 新特性的使用以及一些使用经验分享。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/be5fbebfad2b4863a8cf664843b2106e~tplv-k3u1fbpfcp-zoom-1.image)

## 为什么要升级 Vue3

使用 Vue2.x 的小伙伴都熟悉，Vue2.x 中所有数据都是定义在`data`中，方法定义在`methods`中的，并且使用`this`来调用对应的数据和方法。那 Vue3.x 中就可以不这么玩了， 具体怎么玩我们后续再说， 先说一下 Vue2.x 版本这么写有什么缺陷，所有才会进行升级变更的。

### 回顾 Vue2.x 实现加减

```
<template>
  <div class="homePage">
    <p>count: {{ count }}</p>   
    <p>倍数： {{ multiple }}</p>        
    <div>
      <button style="margin-right: 10px" @click="increase">加1</button>
      <button @click="decrease">减一</button>    
    </div>      
  </div>
</template>
<script>
export default {
  data() {
    return { count: 0 };
  },
  computed: {
    multiple() {
      return 2 * this.count;
    },
  },
  methods: {
    increase() {
      this.count++;
    },
    decrease() {
      this.count--;
    },
  },
};
</script>
```

上面代码只是实现了对`count`的加减以及显示倍数， 就需要分别在 data、methods、computed 中进行操作，当我们增加一个需求，就会出现下图的情况：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/69e4ed25e71843928c8eb480a22b5129~tplv-k3u1fbpfcp-zoom-1.image)

当我们业务复杂了就会大量出现上面的情况， 随着复杂度上升，就会出现这样一张图， 每个颜色的方块表示一个功能：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2fed537233174d438913ba1aee9acb91~tplv-k3u1fbpfcp-zoom-1.image)

甚至一个功能还有会依赖其他功能，全搅合在一起。

当这个组件的代码超过几百行时，这时增加或者修改某个需求， 就要在 data、methods、computed 以及 mounted 中反复的跳转，这其中的的痛苦写过的都知道。

那我们就想啊， 如果可以按照逻辑进行分割，将上面这张图变成下边这张图，是不是就清晰很多了呢, 这样的代码可读性和可维护性都更高：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0df3e8c5207c4655b296d2e9b55dd09e~tplv-k3u1fbpfcp-zoom-1.image)

那么 vue2.x 版本给出的解决方案就是 Mixin, 但是使用 Mixin 也会遇到让人苦恼的问题：

1. 命名冲突问题
2. 不清楚暴露出来的变量的作用
3. 逻辑重用到其他 component 经常遇到问题

关于上面经常出现的问题我就不一一举例了，使用过的小伙伴多多少少都会遇到。文章的重点不是 Mixin, 如果确实想知道的就留言啦~

所以，我们 Vue3.x 就推出了`Composition API`主要就是为了解决上面的问题，将零散分布的逻辑组合在一起来维护，并且还可以将单独的功能逻辑拆分成单独的文件。接下来我们就重点认识`Composition API`。

## Composition API

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/673d8a48ec9d4256b2c86b2918e60bbe~tplv-k3u1fbpfcp-zoom-1.image)

### setup

setup 是 Vue3.x 新增的一个选项， 他是组件内使用 `Composition API`的入口。

**setup 执行时机**

我在学习过程中看到很多文章都说 setup 是在 `beforeCreate`和`created`之间， 这个结论是错误的。实践是检验真理的唯一标准， 于是自己去检验了一下：

```
export default defineComponent({
  beforeCreate() {
    console.log("----beforeCreate----");
  },
  created() {
    console.log("----created----");
  },
  setup() {
    console.log("----setup----");
  },
});
```

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cfa122fc38624892a1cfdd3efa14fdd6~tplv-k3u1fbpfcp-zoom-1.image)

setup 执行时机是在 beforeCreate 之前执行，详细的可以看后面生命周期讲解。

#### setup 参数

使用`setup`时，它接受两个参数：

1. props: 组件传入的属性
2. context

setup 中接受的`props`是响应式的， 当传入新的 props 时，会及时被更新。由于是响应式的， 所以**不可以使用 ES6 解构**，解构会消除它的响应式。
**错误代码示例**， 这段代码会让 props 不再支持响应式：

```
// demo.vue
export default defineComponent ({
    setup(props, context) {
        const { name } = props
        console.log(name)
    },
})
```

那在开发中我们**想要使用解构，还能保持`props`的响应式**，有没有办法解决呢？大家可以思考一下，在后面`toRefs`学习的地方为大家解答。
接下来我们来说一下`setup`接受的第二个参数`context`，我们前面说了`setup`中不能访问 Vue2 中最常用的`this`对象，所以`context`中就提供了`this`中最常用的三个属性：`attrs`、`slot` 和`emit`，分别对应 Vue2.x 中的 `$attr`属性、`slot`插槽 和`$emit`发射事件。并且这几个属性都是自动同步最新的值，所以我们每次使用拿到的都是最新值。

### reactive、ref 与 toRefs

在 vue2.x 中， 定义数据都是在`data`中， 但是 Vue3.x 可以使用`reactive`和`ref`来进行数据定义。
那么`ref`和`reactive`他们有什么区别呢？分别什么时候使用呢？说到这里，我又不得不提一下，看到很多网上不少文章说 (`reactive`用于处理对象的双向绑定，`ref`则处理 js 基础类型的双向绑定)。我其实不太赞同这样的说法，这样很容易初学者认为`ref`就能处理 js 基本类型， 比如`ref`也是可以定义对象的双向绑定的啊， 上段代码：

```
 setup() {
    const obj = ref({count:1, name:"张三"})
    setTimeout(() =>{
        obj.value.count = obj.value.count + 1
        obj.value.name = "李四"
    }, 1000)
    return{
        obj
    }
  }
```

我们将`obj.count`和`obj.name`绑定到页面上也是可以的；但是`reactive`函数确实可以代理一个对象， 但是不能代理基本类型，例如字符串、数字、boolean 等。
接下来使用代码展示一下`ref`、`reactive`的使用：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a824567ade0246098c7f37526585b171~tplv-k3u1fbpfcp-zoom-1.image)
运行效果:
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/64de795c3eab4878893d61025904fb4b~tplv-k3u1fbpfcp-zoom-1.image)
上面的代码中，我们绑定到页面是通过`user.name`,`user.age`；这样写感觉很繁琐，我们能不能直接将`user`中的属性解构出来使用呢? 答案是不能直接对`user`进行结构， 这样会消除它的响应式， 这里就和上面我们说`props`不能使用 ES6 直接解构就呼应上了。那我们就想使用解构后的数据怎么办，解决办法就是**使用`toRefs`**。
toRefs 用于将一个 reactive 对象转化为属性全部为 ref 对象的普通对象。具体使用方式如下：

```vue
<template>
  <div class="homePage">
    <p>第 {{ year }} 年</p>
    <p>姓名： {{ nickname }}</p>
    <p>年龄： {{ age }}</p>
  </div>
</template>

<script>
import { defineComponent, reactive, ref, toRefs } from "vue";
export default defineComponent({
  setup() {
    const year = ref(0);
    const user = reactive({ nickname: "xiaofan", age: 26, gender: "女" });
    setInterval(() => {
      year.value++;
      user.age++;
    }, 1000);
    return {
      year,
      // 使用reRefs
      ...toRefs(user),
    };
  },
});
</script>
```

### 生命周期钩子

我们可以直接看生命周期图来认识都有哪些生命周期钩子 (图片是根据官网翻译后绘制的)：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/de01e730e563406cbf3399861fa23aa4~tplv-k3u1fbpfcp-zoom-1.image)
从图中我们可以看到 Vue3.0 新增了`setup`，这个在前面我们也详细说了， 然后是将 Vue2.x 中的`beforeDestroy`名称变更成`beforeUnmount`; `destroyed` 表更为 `unmounted`，作者说这么变更纯粹是为了更加语义化，因为一个组件是一个`mount`和`unmount`的过程。其他 Vue2 中的生命周期仍然保留。
上边`生命周期图`中并没包含全部的生命周期钩子， 还有其他的几个， 全部生命周期钩子如图所示：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3eadd1ec0ac94343951ae2453cf41fce~tplv-k3u1fbpfcp-zoom-1.image)
我们可以看到`beforeCreate`和`created`被`setup`替换了（但是 Vue3 中你仍然可以使用， 因为 Vue3 是向下兼容的， 也就是你实际使用的是 vue2 的）。其次，钩子命名都增加了`on`; Vue3.x 还新增用于调试的钩子函数`onRenderTriggered`和`onRenderTricked`
下面我们简单使用几个钩子， 方便大家学习如何使用，Vue3.x 中的钩子是需要从 vue 中导入的：

```vue
import { defineComponent, onBeforeMount, onMounted, onBeforeUpdate,onUpdated,
onBeforeUnmount, onUnmounted, onErrorCaptured, onRenderTracked,
onRenderTriggered } from "vue"; export default defineComponent({ //
beforeCreate和created是vue2的 beforeCreate() {
console.log("------beforeCreate-----"); }, created() {
console.log("------created-----"); }, setup() { console.log("------setup-----");
// vue3.x生命周期写在setup中 onBeforeMount(() => {
console.log("------onBeforeMount-----"); }); onMounted(() => {
console.log("------onMounted-----"); }); // 调试哪些数据发生了变化
onRenderTriggered((event) =>{ console.log("------onRenderTriggered-----",event);
}) }, });
```

关于生命周期相关的内容就介绍到这里，下面我们介绍一下 Vue3.x 中`watch`有什么不同。

### watch 与 watchEffect 的用法

> watch 函数用来侦听特定的数据源，并在回调函数中执行副作用。默认情况是惰性的，也就是说仅在侦听的源数据变更时才执行回调。

```vue
watch(source, callback, [options])
```

参数说明：

- source: 可以支持 string,Object,Function,Array; 用于指定要侦听的响应式变量
- callback: 执行的回调函数
- options：支持 deep、immediate 和 flush 选项。

接下来我会分别介绍这个三个参数都是如何使用的， 如果你对 watch 的使用不明白的请往下看：

#### 侦听 reactive 定义的数据

```js
import { defineComponent, ref, reactive, toRefs, watch } from "vue";
export default defineComponent({
  setup() {
    const state = reactive({ nickname: "xiaofan", age: 20 });

    setTimeout(() => {
      state.age++;
    }, 1000);

    // 修改age值时会触发 watch的回调
    watch(
      () => state.age,
      (curAge, preAge) => {
        console.log("新值:", curAge, "老值:", preAge);
      }
    );

    return {
      ...toRefs(state),
    };
  },
});
```

#### 侦听 ref 定义的数据

```js
const year = ref(0);

setTimeout(() => {
  year.value++;
}, 1000);

watch(year, (newVal, oldVal) => {
  console.log("新值:", newVal, "老值:", oldVal);
});
```

#### 侦听多个数据

上面两个例子中，我们分别使用了两个 watch, 当我们需要侦听多个数据源时， 可以进行合并， 同时侦听多个数据：

```vue
watch([() => state.age, year], ([curAge, newVal], [preAge, oldVal]) => {
console.log("新值:", curAge, "老值:", preAge); console.log("新值:", newVal,
"老值:", oldVal); });
```

#### 侦听复杂的嵌套对象

我们实际开发中，复杂数据随处可见， 比如：

```js
const state = reactive({
  room: {
    id: 100,
    attrs: {
      size: "140平方米",
      type: "三室两厅",
    },
  },
});
watch(
  () => state.room,
  (newType, oldType) => {
    console.log("新值:", newType, "老值:", oldType);
  },
  { deep: true }
);
```

如果不使用第三个参数`deep:true`， 是无法监听到数据变化的。
前面我们提到，**默认情况下，watch 是惰性的**, 那什么情况下不是惰性的， 可以立即执行回调函数呢？其实使用也很简单， 给第三个参数中设置`immediate: true`即可。关于`flush`配置，还在学习，后期会补充

#### stop 停止监听

我们在组件中创建的`watch`监听，会在组件被销毁时自动停止。如果在组件销毁之前我们想要停止掉某个监听， 可以调用`watch()`函数的返回值，操作如下：

```
const stopWatchRoom = watch(() => state.room, (newType, oldType) => {
    console.log("新值:", newType, "老值:", oldType);
}, {deep:true});

setTimeout(()=>{
    // 停止监听
    stopWatchRoom()
}, 3000)
```

还有一个监听函数`watchEffect`, 在我看来`watch`已经能满足监听的需求，为什么还要有`watchEffect`呢？虽然我没有 get 到它的必要性，但是还是要介绍一下`watchEffect`，首先看看它的使用和`watch`究竟有何不同。

```
import { defineComponent, ref, reactive, toRefs, watchEffect } from "vue";
export default defineComponent({
  setup() {
    const state = reactive({ nickname: "xiaofan", age: 20 });
    let year = ref(0)

    setInterval(() =>{
        state.age++
        year.value++
    },1000)

    watchEffect(() => {
        console.log(state);
        console.log(year);
      }
    );

    return {
        ...toRefs(state)
    }
  },
});
```

执行结果首先打印一次`state`和`year`值；然后每隔一秒，打印`state`和`year`值。
从上面的代码可以看出， 并没有像`watch`一样需要先传入依赖，`watchEffect`会自动收集依赖, 只要指定一个回调函数。在组件初始化时， 会先执行一次来收集依赖， 然后当收集到的依赖中数据发生变化时， 就会再次执行回调函数。所以总结对比如下：

1. watchEffect 不需要手动传入依赖
2. watchEffect 会先执行一次用来自动收集依赖
3. watchEffect 无法获取到变化前的值， 只能获取变化后的值

上面介绍了 Vue3 `Composition API`的部分内容, 还有很多非常好用的 API, 建议直接查看官网 composition-api。
其实我们也能进行自定义封装。

## 自定义 Hooks

开篇的时候我们使用 Vue2.x 写了一个实现加减的例子， 这里可以将其封装成一个 hook, 我们约定这些「自定义 Hook」以 use 作为前缀，和普通的函数加以区分。
`useCount.ts` 实现：

```ts
import { ref, Ref, computed } from "vue";

type CountResultProps = {
  count: Ref<number>;
  multiple: Ref<number>;
  increase: (delta?: number) => void;
  decrease: (delta?: number) => void;
};

export default function useCount(initValue = 1): CountResultProps {
  const count = ref(initValue);

  const increase = (delta?: number): void => {
    if (typeof delta !== "undefined") {
      count.value += delta;
    } else {
      count.value += 1;
    }
  };
  const multiple = computed(() => count.value * 2);

  const decrease = (delta?: number): void => {
    if (typeof delta !== "undefined") {
      count.value -= delta;
    } else {
      count.value -= 1;
    }
  };

  return {
    count,
    multiple,
    increase,
    decrease,
  };
}
```

接下来看一下在组件中使用`useCount`这个 `hook`:

```ts
<template>
  <p>count: {{ count }}</p>
  <p>倍数： {{ multiple }}</p>
  <div>
    <button @click="increase()">加1</button>
    <button @click="decrease()">减一</button>
  </div>
</template>

<script lang="ts">
import useCount from "../hooks/useCount";
 setup() {
    const { count, multiple, increase, decrease } = useCount(10);
        return {
            count,
            multiple,
            increase,
            decrease,
        };
    },
</script>
```

开篇 Vue2.x 实现，分散在`data`,`method`,`computed`等， 如果刚接手项目，实在无法快速将`data`字段和`method`关联起来，而 Vue3 的方式可以很明确的看出，将 count 相关的逻辑聚合在一起， 看起来舒服多了， 而且`useCount`还可以扩展更多的功能。
项目开发完之后，后续还会写一篇总结项目中使用到的「自定义 Hooks 的文章」，帮助大家更高效的开发， 关于`Composition API`和自定义 Hooks 就介绍到这里， 接下来简单介绍一下 vue2.x 与 vue3 响应式对比。

## 简单对比 vue2.x 与 vue3.x 响应式

其实在 Vue3.x 还没有发布 bate 的时候， 很火的一个话题就是`Vue3.x 将使用 Proxy 取代 Vue2.x 版本的 Object.defineProperty`。
没有无缘无故的爱，也没有无缘无故的恨。为何要将`Object.defineProperty`换掉呢，咋们可以简单聊一下。
我刚上手 Vue2.x 的时候就经常遇到一个问题，数据更新了啊，为何页面不更新呢？什么时候用`$set`更新，什么时候用`$forceUpdate`强制更新，你是否也一度陷入困境。后来的学习过程中开始接触源码，才知道一切的根源都是 `Object.defineProperty`。
对这块想要深入了解的小伙伴可以看这篇文章 为什么 Vue3.0 不再使用 defineProperty 实现数据监听？要详细解释又是一篇文章，这里就简单对比一下`Object.defineProperty` 与 Proxy

1. `Object.defineProperty`只能劫持对象的属性， 而 Proxy 是直接代理对象

由于`Object.defineProperty`只能劫持对象属性，需要遍历对象的每一个属性，如果属性值也是对象，就需要递归进行深度遍历。但是 Proxy 直接代理对象， 不需要遍历操作

2. `Object.defineProperty`对新增属性需要手动进行`Observe`

因为`Object.defineProperty`劫持的是对象的属性，所以新增属性时，需要重新遍历对象， 对其新增属性再次使用`Object.defineProperty`进行劫持。也就是 Vue2.x 中给数组和对象新增属性时，需要使用`$set`才能保证新增的属性也是响应式的, `$set`内部也是通过调用`Object.defineProperty`去处理的。

## Teleport

Teleport 是 Vue3.x 新推出的功能， 没听过这个词的小伙伴可能会感到陌生；翻译过来是`传送`的意思，可能还是觉得不知所以，没事下边我就给大家形象的描述一下。

### Teleport 是什么呢？

Teleport 就像是哆啦 A 梦中的「任意门」，任意门的作用就是可以将人瞬间传送到另一个地方。有了这个认识，我们再来看一下为什么需要用到 Teleport 的特性呢，看一个小例子：
在子组件`Header`中使用到`Dialog`组件，我们实际开发中经常会在类似的情形下使用到 `Dialog` ，此时`Dialog`就被渲染到一层层子组件内部，处理嵌套组件的定位、`z-index`和样式都变得困难。
`Dialog`从用户感知的层面，应该是一个独立的组件，从 dom 结构应该完全剥离 Vue 顶层组件挂载的 DOM；同时还可以使用到 Vue 组件内的状态（`data`或者`props`）的值。简单来说就是,**即希望继续在组件内部使用`Dialog`, 又希望渲染的 DOM 结构不嵌套在组件的 DOM 中**。
此时就需要 Teleport 上场，我们可以用`<Teleport>`包裹`Dialog`, 此时就建立了一个传送门，可以将`Dialog`渲染的内容传送到任何指定的地方。
接下来就举个小例子，看看 Teleport 的使用方式

### Teleport 的使用

我们希望 Dialog 渲染的 dom 和顶层组件是兄弟节点关系, 在`index.html`文件中定义一个供挂载的元素:

```html
<body>
  <div id="app"></div>
  <div id="dialog"></div>
</body>
```

定义一个`Dialog`组件`Dialog.vue`, 留意 `to` 属性， 与上面的`id`选择器一致：

```vue
<template>
  <teleport to="#dialog">
    <div class="dialog">
      <div class="dialog_wrapper">
        <div class="dialog_header" v-if="title">
          <slot name="header">
            <span>{{ title }}</span>
          </slot>
        </div>
      </div>
      <div class="dialog_content">
        <slot></slot>
      </div>
      <div class="dialog_footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </teleport>
</template>
```

最后在一个子组件`Header.vue`中使用`Dialog`组件, 这里主要演示 Teleport 的使用，不相关的代码就省略了。`header`组件

```
<div class="header">
    ...
    <navbar />
    <Dialog v-if="dialogVisible"></Dialog>
</div>
...
```

Dom 渲染效果如下：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/712e61d275cb4b7da5252bb9cd6d2afa~tplv-k3u1fbpfcp-zoom-1.image)
图片. png
可以看到，我们使用 `teleport` 组件，通过 `to` 属性，指定该组件渲染的位置与 `<div id="app"></div>` 同级，也就是在 `body` 下，但是 `Dialog` 的状态 `dialogVisible` 又是完全由内部 Vue 组件控制.

## Suspense

`Suspense`是 Vue3.x 中新增的特性， 那它有什么用呢？别急，我们通过 Vue2.x 中的一些场景来认识它的作用。
Vue2.x 中应该经常遇到这样的场景：

```
<template>
<div>
    <div v-if="!loading">
        ...
    </div>
    <div v-if="loading">
        加载中...
    </div>
</div>
</template>
```

在前后端交互获取数据时， 是一个异步过程，一般我们都会提供一个加载中的动画，当数据返回时配合`v-if`来控制数据显示。
如果你使用过`vue-async-manager`这个插件来完成上面的需求， 你对`Suspense`可能不会陌生，Vue3.x 感觉就是参考了`vue-async-manager`.
Vue3.x 新出的内置组件`Suspense`, 它提供两个`template` slot, 刚开始会渲染一个 fallback 状态下的内容， 直到到达某个条件后才会渲染 default 状态的正式内容， 通过使用`Suspense`组件进行展示异步渲染就更加的简单。:::warning 如果使用 `Suspense`, 要返回一个 promise :::`Suspense` 组件的使用：

```
  <Suspense>
        <template #default>
            <async-component></async-component>
        </template>
        <template #fallback>
            <div>
                Loading...
            </div>
        </template>
  </Suspense>
```

`asyncComponent.vue`:

```
<<template>
<div>
    <h4>这个是一个异步加载数据</h4>
    <p>用户名：{{user.nickname}}</p>
    <p>年龄：{{user.age}}</p>
</div>
</template>

<script>
import { defineComponent } from "vue"
import axios from "axios"
export default defineComponent({
    setup(){
        const rawData = await axios.get("http://xxx.xinp.cn/user")
        return {
            user: rawData.data
        }
    }
})
</script>
```

从上面代码来看，`Suspense` 只是一个带插槽的组件，只是它的插槽指定了`default` 和 `fallback` 两种状态。

## 片段（Fragment）

在 Vue2.x 中， `template`中只允许有一个根节点：

```
<template>
    <div>
        <span></span>
        <span></span>
    </div>
</template>
```

但是在 Vue3.x 中，你可以直接写多个根节点， 是不是很爽：

```
<template>
    <span></span>
    <span></span>
</template>
```

## 更好的 Tree-Shaking

Vue3.x 在考虑到 `tree-shaking`的基础上重构了全局和内部 API, 表现结果就是现在的全局 API 需要通过 `ES Module`的引用方式进行具名引用， 比如在 Vue2.x 中，我们要使用 `nextTick`:

```
// vue2.x
import Vue from "vue"

Vue.nextTick(()=>{
    ...
})
```

`Vue.nextTick()` 是一个从 Vue 对象直接暴露出来的全局 API，其实 `$nextTick()` 只是 `Vue.nextTick()` 的一个简易包装，只是为了方便而把后者的回调函数的 `this` 绑定到了当前的实例。虽然我们借助`webpack`的`tree-shaking`, 但是不管我们实际上是否使用`Vue.nextTick()`, 最终都会进入我们的生产代码， 因为 Vue 实例是作为单个对象导出的， 打包器无法坚持出代码总使用了对象的哪些属性。
在 Vue3.x 中改写成这样：

```
import { nextTick } from "vue"

nextTick(() =>{
    ...
})
```

### 受影响的 API

这是一个比较大的变化， 因为以前的全局 API 现在只能通过具名导入，这一更改会对以下 API 有影响：

- `Vue.nextTick`
- `Vue.observable`（用 `Vue.reactive` 替换）
- `Vue.version`
- `Vue.compile`（仅限完整版本时可用）
- `Vue.set`（仅在 2.x 兼容版本中可用）
- `Vue.delete`（与上同）

### 内置工具

出来上面的 API 外， 还有许多内置的组件
以上仅适用于 `ES Modules` builds，用于支持 tree-shaking 的绑定器——UMD 构建仍然包括所有特性，并暴露 Vue 全局变量上的所有内容 (编译器将生成适当的输出，以使用全局外的 api 而不是导入)。:::
前面都是 Vue3.0 的一些新特性，后面着重介绍一下相对于 Vue2.x 来说， 有什么变更呢？

## 变更

### slot 具名插槽语法

在 Vue2.x 中， 具名插槽的写法：

```
<!--  子组件中：-->
<slot name="title"></slot>
```

在父组件中使用：

```
<template slot="title">
    <h1>歌曲：成都</h1>
<template>
```

如果我们要**在 slot 上面绑定数据，可以使用作用域插槽**，实现如下：

```
// 子组件
<slot name="content" :data="data"></slot>
export default {
    data(){
        return{
            data:["走过来人来人往","不喜欢也得欣赏","陪伴是最长情的告白"]
        }
    }
}
```

```
<!-- 父组件中使用 -->
<template slot="content" slot-scope="scoped">
    <div v-for="item in scoped.data">{{item}}</div>
<template>
```

在 Vue2.x 中具名插槽和作用域插槽分别使用`slot`和`slot-scope`来实现， 在 Vue3.0 中将`slot`和`slot-scope`进行了合并同意使用。
Vue3.0 中`v-slot`：

```
<!-- 父组件中使用 -->
 <template v-slot:content="scoped">
   <div v-for="item in scoped.data">{{item}}</div>
</template>

<!-- 也可以简写成： -->
<template #content="{data}">
    <div v-for="item in data">{{item}}</div>
</template>
```

### 自定义指令

首先回顾一下 Vue 2 中实现一个自定义指令：

```
// 注册一个全局自定义指令 `v-focus`
Vue.directive('focus', {
  // 当被绑定的元素插入到 DOM 中时……
  inserted: function (el) {
    // 聚焦元素
    el.focus()
  }
})
```

在 Vue 2 中， 自定义指令通过以下几个可选钩子创建：

- bind：只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。
- inserted：被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)。
- update：所在组件的 VNode 更新时调用，但是可能发生在其子 VNode 更新之前。指令的值可能发生了改变，也可能没有。但是你可以通过比较更新前后的值来忽略不必要的模板更新 (详细的钩子函数参数见下)。
- componentUpdated：指令所在组件的 VNode 及其子 VNode 全部更新后调用。
- unbind：只调用一次，指令与元素解绑时调用。

在 Vue 3 中对自定义指令的 API 进行了更加语义化的修改， 就如组件生命周期变更一样， 都是为了更好的语义化， 变更如下：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5a85dca78e2f4efcab61b03c98ec80de~tplv-k3u1fbpfcp-zoom-1.image)
所以在 Vue3 中， 可以这样来自定义指令：

```
const { createApp } from "vue"

const app = createApp({})
app.directive('focus', {
    mounted(el) {
        el.focus()
    }
})
```

然后可以在模板中任何元素上使用新的 `v-focus`指令， 如下：

```
<input v-focus />
```

### v-model 升级

在使用 Vue 3 之前就了解到 `v-model` 发生了很大的变化， 使用过了之后才真正的 get 到这些变化， 我们先纵观一下发生了哪些变化， 然后再针对的说一下如何使用：

- 变更：在自定义组件上使用`v-model`时， 属性以及事件的默认名称变了
- 变更：`v-bind`的`.sync`修饰符在 Vue 3 中又被去掉了, 合并到了`v-model`里
- 新增：同一组件可以同时设置多个 `v-model`
- 新增：开发者可以自定义 `v-model`修饰符

有点懵？别着急，往下看 在 Vue2 中， 在组件上使用 `v-model`其实就相当于传递了`value`属性， 并触发了`input`事件：

```
<!-- Vue 2 -->
<search-input v-model="searchValue"><search-input>

<!-- 相当于 -->
<search-input :value="searchValue" @input="searchValue=$event"><search-input>
```

这时`v-model`只能绑定在组件的`value`属性上，那我们就不开心了， 我们就像给自己的组件用一个别的属性，并且我们不想通过触发`input`来更新值，在`.async`出来之前，Vue 2 中这样实现：

```
// 子组件：searchInput.vue
export default {
    model:{
        prop: 'search',
        event:'change'
    }
}
```

修改后， searchInput 组件使用`v-model`就相当于这样：

```
<search-input v-model="searchValue"><search-input>
<!-- 相当于 -->
<search-input :search="searchValue" @change="searchValue=$event"><search-input>
```

但是在实际开发中，有些场景我们可能需要对一个 prop 进行 “双向绑定”， 这里以最常见的 modal 为例子：modal 挺合适属性双向绑定的，外部可以控制组件的`visible`显示或者隐藏，组件内部关闭可以控制 `visible`属性隐藏，同时 visible 属性同步传输到外部。组件内部， 当我们关闭`modal`时, 在子组件中以 update:PropName 模式触发事件：

```
this.$emit('update:visible', false)
```

然后在父组件中可以监听这个事件进行数据更新：

```
<modal :visible="isVisible" @update:visible="isVisible = $event"></modal>
```

此时我们也可以使用`v-bind.async`来简化实现：

```
<modal :visible.async="isVisible"></modal>
```

上面回顾了 Vue2 中`v-model`实现以及组件属性的双向绑定，那么**在 Vue 3 中应该怎样实现的呢？**
在 Vue3 中, 在自定义组件上使用`v-model`, 相当于传递一个`modelValue` 属性， 同时触发一个`update:modelValue`事件：

```
<modal v-model="isVisible"></modal>
<!-- 相当于 -->
<modal :modelValue="isVisible" @update:modelValue="isVisible = $event"></modal>
```

如果要绑定属性名， 只需要给`v-model`传递一个参数就行, 同时可以绑定多个`v-model`：

```
<modal v-model:visible="isVisible" v-model:content="content"></modal>

<!-- 相当于 -->
<modal
    :visible="isVisible"
    :content="content"
    @update:visible="isVisible"
    @update:content="content"
/>
```

不知道你有没有发现，这个写法完全没有`.async`什么事儿了， 所以啊，Vue 3 中又抛弃了`.async`写法， 统一使用`v-model`

### 异步组件

Vue3 中 使用 `defineAsyncComponent` 定义异步组件，配置选项 `component` 替换为 `loader` ,Loader 函数本身不再接收 resolve 和 reject 参数，且必须返回一个 Promise，用法如下：

```
<template>
  <!-- 异步组件的使用 -->
  <AsyncPage />
</tempate>

<script>
import { defineAsyncComponent } from "vue";

export default {
  components: {
    // 无配置项异步组件
    AsyncPage: defineAsyncComponent(() => import("./NextPage.vue")),

    // 有配置项异步组件
    AsyncPageWithOptions: defineAsyncComponent({
   loader: () => import(".NextPage.vue"),
   delay: 200,
   timeout: 3000,
   errorComponent: () => import("./ErrorComponent.vue"),
   loadingComponent: () => import("./LoadingComponent.vue"),
 })
  },
}
</script>
```

参考文章：

- vue3 全家桶入门指南
- 学习一波 Vue3 新特性
- Vue3.0 新特性以及使用变更总结(实际工作用到的)
- 了不起的 Vue3

## 想法初衷

---

抽时间梳理一下符合前端工程师成长路线的知识脉络，尽可能给行业多共享一些经验总结，同时也能系统回顾和巩固自身。

> 为了方便阅读理解，本文代码已经上传[Github](https://github.com/SandySY/vue-notes)

文中如有错误，欢迎在评论区指正，如果有所帮助，欢迎点赞和关注
