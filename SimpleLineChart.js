import React from 'react';
import { View, Dimensions } from 'react-native';
import { Svg, Polyline } from 'react-native-svg';

const SimpleLineChart = ({ data }) => {
    const width = Dimensions.get('window').width - 40; // Ajustar según tus necesidades
    const height = 220; // Ajustar según tus necesidades
    const max = Math.max(...data);
    const min = Math.min(...data);

    const points = data.map((point, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((point - min) / (max - min)) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <View>
            <Svg width={width} height={height}>
                <Polyline
                    points={points}
                    fill="none"
                    stroke="blue"
                    strokeWidth="2"
                />
            </Svg>
        </View>
    );
};

export default SimpleLineChart;
