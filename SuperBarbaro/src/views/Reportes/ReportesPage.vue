<template>
  <ion-page>
    <AppHeader titulo="REPORTES" :mostrarVolver="false" />

    <ion-content class="fondo-reportes">
      <div class="contenedor-reportes">

        <button class="boton-reporte" @click="irVentasDiarias">
          <ion-icon name="bar-chart-outline" class="icono-reporte" />
          <span>Ventas diarias</span>
        </button>

        <button class="boton-reporte" @click="irEstimaciones">
          <ion-icon name="analytics-outline" class="icono-reporte" />
          <span>Estimaciones</span>
        </button>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonContent, IonIcon } from '@ionic/vue'
import { addIcons } from 'ionicons'
import { barChartOutline, analyticsOutline } from 'ionicons/icons'
import AppHeader from '../../components/AppHeader.vue'
import { useRouter } from 'vue-router'

addIcons({ 'bar-chart-outline': barChartOutline, 'analytics-outline': analyticsOutline })

const router = useRouter()

const irVentasDiarias = () => router.push('/tabs/reportes/ventas-diarias')
const irEstimaciones = () => router.push('/tabs/reportes/estimaciones')
</script>

<style scoped>
.fondo-reportes {
  --background: white;
}

.contenedor-reportes {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px 24px;
}

.boton-reporte {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  max-width: 320px;
  padding: 28px 20px;
  border: 2px solid black;
  border-radius: 20px;
  background: transparent;
  color: black;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.boton-reporte:active {
  background: black;
  color: white;
}

.icono-reporte {
  font-size: 36px;
}
</style>