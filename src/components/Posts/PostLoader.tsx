import { Box, SkeletonCircle, SkeletonText } from "@chakra-ui/react";
import React from "react";

const PostLoader: React.FC = () => {
  return (
    <>
      <Box padding="6" boxShadow="lg" bg="white">
        <SkeletonCircle size="20" />
        <SkeletonText mt="4" noOfLines={4} spacing="4" skeletonHeight="2" />
      </Box>
      <Box padding="6" boxShadow="lg" bg="white" mt={8}>
        <SkeletonCircle size="20" />
        <SkeletonText mt="4" noOfLines={4} spacing="4" skeletonHeight="2" />
      </Box>
    </>
  );
};
export default PostLoader;
