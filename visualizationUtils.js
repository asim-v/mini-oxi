export const calculateDCComponent = (values) => {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
};

export const findPeaks = (data, distance = 5, threshold = 0.002) => {
    const peaks = [];
    for (let i = distance; i < data.length - distance; i++) {
        let isPeak = true;
        for (let j = 1; j <= distance; j++) {
            if (data[i] <= data[i - j] || data[i] <= data[i + j]) {
                isPeak = false;
                break;
            }
        }
        if (isPeak && data[i] > threshold) {
            peaks.push(i);
        }
    }
    return peaks;
};

export const calculateSPO2 = (irValues, redValues) => {
    const DC_ir = calculateDCComponent(irValues);
    const DC_red = calculateDCComponent(redValues);

    const irAC = Math.max(...irValues) - Math.min(...irValues);
    const redAC = Math.max(...redValues) - Math.min(...redValues);

    const R = (redAC / DC_red) / (irAC / DC_ir);
    const SPO2 = 110 - 25 * R;

    return SPO2;
};

export const calculateBPM = (irValues, samplingFrequency) => {
    const peaks = findPeaks(irValues, 3, 0.001);

    let BPM = 0;
    if (peaks.length > 1 && samplingFrequency > 0) {
        const peakIntervals = peaks
            .map((peak, i) => (i > 0 ? peaks[i] - peaks[i - 1] : 0))
            .filter(interval => interval > 0);

        if (peakIntervals.length > 0) {
            const avgInterval = peakIntervals.reduce((sum, interval) => sum + interval, 0) / peakIntervals.length;
            BPM = Math.round(60 * samplingFrequency / avgInterval);
        }
    }
    
    return BPM;
};

export const calculateSPO2AndBPM = (irValues, redValues, samplingFrequency) => {
    const SPO2 = calculateSPO2(irValues, redValues);
    const BPM = calculateBPM(irValues, samplingFrequency);
    
    return { SPO2, BPM };
};
