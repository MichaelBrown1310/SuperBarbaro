<template>
  <ion-app>
    <AlertasStock />
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import AlertasStock from '@/components/AlertasStock.vue'
</script>
