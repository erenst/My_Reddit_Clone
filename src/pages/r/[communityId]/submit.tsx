import { useAuthState } from "react-firebase-hooks/auth";
import PageContent from "../../../components/Layout/PageContent";
import NewPostForm from "../../../components/Posts/NewPostForm";
import { Box, Text } from "@chakra-ui/react";
import React from "react";
import { auth } from "@/src/firebase/clientApp";
import { useRecoilState } from "recoil";
import { communityState } from "@/src/atoms/communitiesAtom";
import useCommunityData from "@/src/hooks/useCommunityData";
import About from "@/src/components/Community/About";

const SubmitPostPage: React.FC = () => {
  const [user] = useAuthState(auth);
  // const communityStateValue = useRecoilState(communityState);
  const { communityStateValue } = useCommunityData();

  return (
    <PageContent>
      <>
        <Box p="14px 0px" borderBottom="1px solid" borderColor="white">
          <Text>Create a post</Text>
        </Box>
        {user && (
          <NewPostForm
            user={user}
            communityImageURL={
              communityStateValue.currentCommunity?.imageURL as string
            }
          />
        )}
      </>
      <>
        {communityStateValue.currentCommunity && (
          <About communityData={communityStateValue.currentCommunity} />
        )}
      </>
    </PageContent>
  );
};
export default SubmitPostPage;
