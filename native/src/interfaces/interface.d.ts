interface LocationDetails {
  id: number;
  name: String;
  description: String;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  type: String;
}