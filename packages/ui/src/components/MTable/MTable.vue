<template>
    <table class="m-table">
       <slot />
    </table>
</template>

<style lang="scss">
.m-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;

  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  th {
    font-weight: 600;
    background-color: #f6f8fa;
  }
}
</style>
