"use client";
import { selectHistory } from "@/lib/taskSlice";
import "react";
import { useSelector } from "react-redux";

export const History = () => {
  const historyList = useSelector(selectHistory);
  return (
    <div className="p-2 flex flex-col">
      <h3 className="mb-5">Behold, History.</h3>
      {historyList.map((m, i) => (
        <p key={i}>{m}</p>
      ))}
    </div>
  );
};
