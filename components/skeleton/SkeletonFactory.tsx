import React from "react";

import SkeletonDetailWithHeader from "./presets/SkeletonDetailWithHeader";
import SkeletonSection from "./presets/SkeletonSection";
//import SkeletonCard from "./presets/SkeletonCard";
//import SkeletonInput from "./presets/SkeletonInput";
//import SkeletonList from "./presets/SkeletonList";

export default function SkeletonFactory({ type, ...props }: any) {
  switch (type) {
    case "header":
      return <SkeletonDetailWithHeader {...props} />;

    case "section":
      return <SkeletonSection {...props} />;

    case "card":
    //  return <SkeletonCard {...props} />;

    case "input":
      //return <SkeletonInput {...props} />;

    case "list":
      //return <SkeletonList {...props} />;

    default:
      return null;
  }
}
