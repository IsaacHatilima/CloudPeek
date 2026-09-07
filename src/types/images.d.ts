// Static image imports (`import mark from "../assets/brand/mark.png"`) resolve
// through Metro to an opaque asset reference that React Native's Image accepts.
declare module "*.png" {
  const source: import("react-native").ImageSourcePropType;
  export default source;
}
