"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFullRate = exports.getSimpleRate = exports.getShippingRates = exports.getShippingRatesForWeight = exports.fullShippingRate = void 0;
const ShippingRate_1 = require("../models/ShippingRate");
const sequelize_1 = require("sequelize");
// Function to calculate shipping rate
const fullShippingRate = (length_1, width_1, height_1, weight_1, zone_1, ...args_1) => __awaiter(void 0, [length_1, width_1, height_1, weight_1, zone_1, ...args_1], void 0, function* (length, width, height, weight, zone, unit = "lbs") {
    if (unit === "oz" && weight <= 1) {
        weight /= 16; // Convert pounds to ounces
        unit = "lbs"; // Change unit to ounces
    }
    const volumetricWeight = unit === "inch"
        ? (length * width * height) / 250
        : (length * width * height) / 9000;
    weight = Math.ceil(Math.max(volumetricWeight, weight));
    if (width > 108 || height > 108 || length > 108) {
        return 1000;
    }
    const shippingRates = yield (0, exports.getShippingRatesForWeight)(weight, unit);
    if (!shippingRates) {
        throw new Error(`No shipping rate found for the specified weight and zone ${weight} ${unit}`);
    }
    const rate = Number(shippingRates[`zone${zone}`]); // Convert rate to a number
    const pickupCharge = Math.max(125, 0.065 * weight);
    const fuelSurcharge = 0.10 * rate; // Use the converted rate
    const totalCost = rate + pickupCharge + fuelSurcharge;
    return totalCost;
});
exports.fullShippingRate = fullShippingRate;
// Function to get shipping rates for a specific weight and zone
const getShippingRatesForWeight = (weight, unit) => __awaiter(void 0, void 0, void 0, function* () {
    if (weight > 150) {
        return {
            weightRange: '150<n=999999',
            unit: 'lbs',
            zone1: 1000,
            zone2: 1000,
            zone3: 1000,
            zone4: 1000,
            zone5: 1000,
            zone6: 1000,
            zone7: 1000,
            zone8: 1000,
        };
    }
    const data = yield ShippingRate_1.ShippingRate.findAll({
        where: {
            unit,
            weightRange: { [sequelize_1.Op.regexp]: `\\d*<n=${weight}` }
        }
    });
    return data.find(row => {
        const [min, max] = row.weightRange.split('<n=').map(parseFloat);
        return weight > min && weight <= max;
    }) || null;
});
exports.getShippingRatesForWeight = getShippingRatesForWeight;
const getShippingRates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rates = yield ShippingRate_1.ShippingRate.findAll();
        res.json(rates);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.getShippingRates = getShippingRates;
const getSimpleRate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { unit, weight } = req.query;
    if (!unit || !weight) {
        return res.status(400).json({ message: 'Unit and weight are required' });
    }
    try {
        const weightNum = parseFloat(weight);
        const rates = yield (0, exports.getShippingRatesForWeight)(weightNum, unit);
        if (!rates) {
            return res.status(404).json({ message: `can not getrate for  ${weightNum} and ${unit}` });
        }
        res.json(rates);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getSimpleRate = getSimpleRate;
const getFullRate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { length, width, height, weight, zone, unit } = req.query;
    if (!length || !width || !height || !weight || !zone || !unit) {
        return res.status(400).json({ message: 'All parameters are required: length, width, height, weight, zone, unit' });
    }
    try {
        const lengthNum = parseFloat(length);
        const widthNum = parseFloat(width);
        const heightNum = parseFloat(height);
        const weightNum = parseFloat(weight);
        const zoneNum = parseInt(zone, 10);
        const totalCost = yield (0, exports.fullShippingRate)(lengthNum, widthNum, heightNum, weightNum, zoneNum, unit);
        res.json({ totalCost });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getFullRate = getFullRate;