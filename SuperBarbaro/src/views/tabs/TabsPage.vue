<template>

<ion-page>

<ion-tabs>

<ion-router-outlet></ion-router-outlet>

<ion-tab-bar slot="bottom">

<ion-tab-button tab="ventas" href="/tabs/ventas">
<ion-icon :icon="restaurantOutline"></ion-icon>
</ion-tab-button>

<ion-tab-button tab="inventario" href="/tabs/inventario">
<ion-icon :icon="cubeOutline"></ion-icon>
</ion-tab-button>

<ion-tab-button tab="reportes" href="/tabs/reportes">
<ion-icon :icon="documentTextOutline"></ion-icon>
</ion-tab-button>

<ion-tab-button tab="perfil" href="/tabs/perfil">
<ion-icon :icon="personOutline"></ion-icon>
</ion-tab-button>

</ion-tab-bar>

</ion-tabs>

</ion-page>

</template>


<script setup>

import {
IonPage,
IonTabs,
IonRouterOutlet,
IonTabBar,
IonTabButton,
IonIcon
} from '@ionic/vue'

import {
restaurantOutline,
cubeOutline,
documentTextOutline,
personOutline
} from 'ionicons/icons'

</script>
