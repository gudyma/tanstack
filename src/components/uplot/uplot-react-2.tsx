import React from "react";
import UplotReactRange from "./uplot-react-range";

//for generating random numbers;
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomNumbersArray(length) {
  const randomNumbersArray = [];

  for (let i = 0; i < length; i++) {
    const randomNumber = getRandomNumber(10, 100);
    randomNumbersArray.push(randomNumber);
  }

  return randomNumbersArray;
}

//for generating timestamps
function generateTimestamps(length) {
  const timestamps = [];
  const intervalInMinutes = 1;

  const now = Math.floor(Date.now() / 1000); // Current Unix timestamp in seconds

  for (let i = 0; i < length; i++) {
    const timestamp = now + i * intervalInMinutes * 60;
    timestamps.push(timestamp);
  }

  return timestamps;
}

export default function HooksAppRange({
  x,
  y1,
  y2,
}: {
  x?: any[];
  y1?: any[];
  y2?: any[];
}) {
  const data = React.useMemo(() => {
    return [
      // x-values (timestamps)
      x,
      y1, // y-values (series 1)
      y2, // y-values (series 2)
    ];
  }, []);

  return (
    <UplotReactRange
      key="hooks-key"
      data={data}
      onDelete={(/* chart: uPlot */) => console.log("Deleted from hooks")}
      onCreate={(/* chart: uPlot */) => console.log("Created from hooks")}
    />
  );
}
