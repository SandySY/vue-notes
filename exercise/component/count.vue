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
module.exports = {
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
