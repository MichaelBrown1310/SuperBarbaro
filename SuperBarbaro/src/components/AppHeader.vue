<template>

<ion-header>

<ion-toolbar class="barra">

<ion-title class="titulo">
{{ titulo }}
</ion-title>

</ion-toolbar>

</ion-header>

</template>

<script setup>

import {
IonHeader,
IonToolbar,
IonTitle,
IonButtons,
IonButton,
IonIcon
} from '@ionic/vue'

import {
useRoute
} from 'vue-router'

defineProps({
titulo: String
})

</script>

<style>

.barra{
--background:white;
--color:black;
border-bottom:2px solid black;
}

.titulo{
text-align:center;
font-weight:600;
font-size:20px;
color:black;
}

ion-icon{
--background:white;

}



</style>
