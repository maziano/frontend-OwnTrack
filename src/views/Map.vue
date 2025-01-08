<template>
  <div class="map-wrapper">
    <LMap
      v-if="isMapReady"
      ref="map"
      :center="mapCenter"
      :zoom="mapZoom"
      :options="{ zoomControl: false }"
      @update:center="setMapCenter"
      @update:zoom="setMapZoom"
    >
      <LControlZoom
        v-if="controls.zoom.display"
        :position="controls.zoom.position"
      />
      <LControlScale
        v-if="controls.scale.display"
        :position="controls.scale.position"
        :max-width="controls.scale.maxWidth"
        :metric="controls.scale.metric"
        :imperial="controls.scale.imperial"
      />
      <LTileLayer
        :url="url"
        :attribution="attribution"
        :tile-size="tileSize"
        :options="{ maxNativeZoom, maxZoom, zoomOffset }"
      />

      <template v-if="map.layers.line">
        <LPolyline
          v-for="(group, i) in filteredLocationHistoryLatLngGroups"
          :key="i"
          :lat-lngs="group"
          v-bind="polyline"
        />
      </template>

      <template v-for="(userDevices, user) in filteredLocationHistory">
        <template v-for="(deviceLocations, device) in userDevices">
          <template
            v-for="(l, n) in deviceLocationsWithNameAndFace(
              user,
              device,
              deviceLocations
            )"
          >
            <LCircleMarker
              v-if="map.layers.poi && l.poi"
              :key="`${l.topic}-poi-${n}`"
              :lat-lng="[l.lat, l.lon]"
              v-bind="poiMarker"
            >
              <LTooltip :options="{ permanent: true }">
                {{ l.poi }}
              </LTooltip>
            </LCircleMarker>
            <LCircleMarker
              v-if="map.layers.points"
              :key="`${l.topic}-location-${n}`"
              :lat-lng="[l.lat, l.lon]"
              v-bind="circleMarker"
            >
              <LDeviceLocationPopup
                :user="user"
                :device="device"
                :name="l.name"
                :face="l.face"
                :timestamp="l.tst"
                :iso-local="l.isolocal"
                :time-zone="l.tzname"
                :lat="l.lat"
                :lon="l.lon"
                :alt="l.alt"
                :battery="l.batt"
                :speed="l.vel"
                :regions="l.inregions"
                :wifi="{ ssid: l.SSID, bssid: l.BSSID }"
                :address="l.addr"
              ></LDeviceLocationPopup>
            </LCircleMarker>
          </template>
        </template>
      </template>

      <template v-if="map.layers.last">
        <LCircle
          v-for="l in lastLocations"
          :key="`${l.topic}-circle`"
          :lat-lng="[l.lat, l.lon]"
          :radius="l.acc"
          v-bind="circle"
        />

        <LMarker
          v-for="l in lastLocations"
          :key="`${l.topic}-marker`"
          :lat-lng="[l.lat, l.lon]"
          :icon="markerIcon"
        >
          <LDeviceLocationPopup
            :user="l.username"
            :device="l.device"
            :name="l.name"
            :face="l.face"
            :timestamp="l.tst"
            :iso-local="l.isolocal"
            :time-zone="l.tzname"
            :lat="l.lat"
            :lon="l.lon"
            :alt="l.alt"
            :battery="l.batt"
            :speed="l.vel"
            :regions="l.inregions"
            :wifi="{ ssid: l.SSID, bssid: l.BSSID }"
            :options="{ className: 'leaflet-popup--for-pin', maxWidth: 400 }"
            :address="l.addr"
          />
        </LMarker>
      </template>

      <template v-if="map.layers.heatmap">
        <LHeatmap
          v-if="filteredLocationHistoryLatLngs.length"
          :lat-lng="filteredLocationHistoryLatLngs"
          :max="heatmap.max"
          :radius="heatmap.radius"
          :blur="heatmap.blur"
          :gradient="heatmap.gradient"
        />
      </template>
    </LMap>
  </div>
</template>

<script>
import { mapGetters, mapState, mapMutations } from "vuex";
import L from "leaflet";
import {
  LMap,
  LTileLayer,
  LControlScale,
  LControlZoom,
  LMarker,
  LCircleMarker,
  LCircle,
  LPolyline,
  LTooltip,
} from "vue2-leaflet";
import "leaflet/dist/leaflet.css";
import * as types from "@/store/mutation-types";
import LCustomMarker from "@/components/LCustomMarker";
import LHeatmap from "@/components/LHeatmap.vue";
import LDeviceLocationPopup from "@/components/LDeviceLocationPopup.vue";

export default {
  components: {
    LMap,
    LTileLayer,
    LControlScale,
    LControlZoom,
    LMarker,
    LCircleMarker,
    LCircle,
    LPolyline,
    LDeviceLocationPopup,
    LHeatmap,
    LTooltip,
  },
  data() {
    return {
      attribution: this.$config.map.attribution,
      center: this.$store.state.map.center,
      controls: this.$config.map.controls,
      heatmap: this.$config.map.heatmap,
      markerIcon: LCustomMarker,
      maxZoom: this.$config.map.maxZoom,
      maxNativeZoom: this.$config.map.maxNativeZoom,
      tileSize: this.$config.map.tileSize,
      url: this.$config.map.url,
      zoom: this.$store.state.map.zoom,
      zoomOffset: this.$config.map.zoomOffset,
      circle: {
        ...this.$config.map.circle,
        color: this.$config.map.circle.color || this.$config.primaryColor,
        fillColor:
          this.$config.map.circle.fillColor || this.$config.primaryColor,
      },
      circleMarker: {
        ...this.$config.map.circleMarker,
        color: this.$config.map.circleMarker.color || this.$config.primaryColor,
      },
      poiMarker: this.$config.map.poiMarker,
      polyline: {
        ...this.$config.map.polyline,
        color: this.$config.map.polyline.color || this.$config.primaryColor,
      },
    };
  },
  computed: {
    ...mapGetters([
      "filteredLocationHistory",
      "filteredLocationHistoryLatLngs",
      "filteredLocationHistoryLatLngGroups",
    ]),
    ...mapState(["lastLocations", "map"]),
    mapCenter() {
      if (!this.map) {
        console.warn('Map state is undefined');
        return [0, 0];
      }
      
      if (Array.isArray(this.map.center)) {
        return this.map.center;
      }
      
      if (this.map.center?.lat !== undefined && this.map.center?.lng !== undefined) {
        return [this.map.center.lat, this.map.center.lng];
      }
      
      console.warn('Invalid map center format:', this.map.center);
      return [0, 0];
    },
    mapZoom() {
      return this.map?.zoom || 13;
    },
    isMapReady() {
      return Boolean(this.map && this.mapCenter && this.mapZoom);
    }
  },
  watch: {
    lastLocations() {
      if (this.$config.onLocationChange.fitView) {
        this.fitView();
      }
    },
    filteredLocationHistory() {
      this.fitView();
    },
  },
  mounted() {
    console.log('Map mounted:', {
      center: this.mapCenter,
      zoom: this.mapZoom,
      map: this.map,
      config: this.$config.map
    });

    this.$nextTick(() => {
      if (this.$refs.map) {
        this.$refs.map.mapObject.invalidateSize();
      }
    });
  },
  created() {
    console.log('Map component created:', {
      map: this.map,
      center: this.mapCenter,
      zoom: this.mapZoom,
      ready: this.isMapReady
    });
  },
  methods: {
    ...mapMutations({
      setMapCenter: types.SET_MAP_CENTER,
      setMapZoom: types.SET_MAP_ZOOM,
    }),
    async fitView() {
      if (!this.isMapReady || !this.$refs.map) {
        console.warn('Map not ready');
        return;
      }

      try {
        if (
          (this.map.layers.line ||
            this.map.layers.points ||
            this.map.layers.poi ||
            this.map.layers.heatmap) &&
          Array.isArray(this.filteredLocationHistoryLatLngs) &&
          this.filteredLocationHistoryLatLngs.length > 0
        ) {
          await this.$nextTick();
          this.$refs.map.mapObject.fitBounds(
            new L.LatLngBounds(this.filteredLocationHistoryLatLngs)
          );
        } else if (
          this.map.layers.last &&
          Array.isArray(this.lastLocations) &&
          this.lastLocations.length > 0
        ) {
          const locations = this.lastLocations
            .filter(l => l && typeof l.lat === 'number' && typeof l.lon === 'number')
            .map(l => L.latLng(l.lat, l.lon));

          if (locations.length > 0) {
            await this.$nextTick();
            this.$refs.map.mapObject.fitBounds(new L.LatLngBounds(locations), {
              maxZoom: this.maxNativeZoom
            });
          }
        }
      } catch (error) {
        console.error('Error in fitView:', error);
      }
    },
    deviceLocationsWithNameAndFace(user, device, deviceLocations) {
      if (!Array.isArray(deviceLocations)) {
        console.warn('deviceLocations is not an array:', deviceLocations);
        return [];
      }

      if (!Array.isArray(this.lastLocations)) {
        console.warn('lastLocations is not an array');
        return deviceLocations;
      }

      const lastLocation = this.lastLocations.find(
        l => l?.username === user && l?.device === device
      );

      if (!lastLocation) {
        return deviceLocations;
      }

      return deviceLocations.map(l => ({
        ...l,
        name: lastLocation.name,
        face: lastLocation.face
      }));
    }
  },
};
</script>

<style scoped>
.map-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  width: 100%;
}

.vue2-leaflet-map {
  height: 100%;
  width: 100%;
}
</style>
