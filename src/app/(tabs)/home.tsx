// CampusMap.tsx
import MapView, { UrlTile } from 'react-native-maps';

<MapView
  style={{ flex: 1 }}
  provider={undefined}   // ❗ NOT PROVIDER_GOOGLE — omit entirely
  mapType="none"         // ❗ MUST be "none" for custom tiles to show
  initialRegion={{
    latitude: YOUR_CAMPUS_LAT,
    longitude: YOUR_CAMPUS_LNG,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  }}
>
  <UrlTile
    urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    maximumZ={19}
    flipY={false}
    tileSize={256}
  />
</MapView>