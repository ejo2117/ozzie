import * as d3 from "d3"

const colors = {
    rainbow: (x: d3.NumberValue) => d3.scaleSequential([0, 360], d3.interpolateRainbow)(x),
    blackwhite: (x: d3.NumberValue) => d3.scaleSequential([0, 360], d3.interpolateRgb.gamma(0.5)('white', 'black'))(x),
    furnace: (x: d3.NumberValue) =>{ 
        return d3.scaleSequential([0, 360], d3.interpolateRgb.gamma(0.5)('#233D4D', '#FE7F2D'))(x)},
    red: (x: d3.NumberValue) => d3.scaleSequential([0, 360], d3.interpolateRgb.gamma(0.5)('#DE9151', '#F34213'))(x),
}

export { colors }