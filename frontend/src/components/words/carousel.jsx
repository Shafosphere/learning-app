import React from "react";

export default function Carousel({ carousel }) {
    return (
      <>
        {Object.entries(carousel).map(([key, value]) => (
          <div key={key} id={key} className={`box-words ${value}`}></div>
        ))}
      </>
    );
  }
  