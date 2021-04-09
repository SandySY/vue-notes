<template>
    
  <div class="homePage">
        
    <p>count: {{ count }}</p>
        
    <p>倍数： {{ multiple }}</p>
        
    <div>
              <button style="margin-right: 10px" @click="increase">加1</button
      >         <button @click="decrease">减一</button>    
    </div>
      
  </div>
</template>
<script>
// demo.vue
export default defineComponent({
  setup(props, context) {
    const { name } = props;
    console.log(name);
  },
});
</script>
