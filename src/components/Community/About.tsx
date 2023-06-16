import {
  Community,
  CommunitySnippet,
  communityState,
} from "@/src/atoms/communitiesAtom";
import { auth, firestore, storage } from "@/src/firebase/clientApp";
import useSelectFile from "@/src/hooks/useSelectFile";
import {
  Box,
  Flex,
  Text,
  Icon,
  Stack,
  Divider,
  Button,
  Image,
  Spinner,
} from "@chakra-ui/react";
import { doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { FaReddit } from "react-icons/fa";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { RiCakeLine } from "react-icons/ri";
import { useSetRecoilState } from "recoil";
type AboutProps = {
  communityData: Community;
};

const About: React.FC<AboutProps> = ({ communityData }) => {
  const [user] = useAuthState(auth);
  const selectFileRef = useRef<HTMLInputElement>(null);
  const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile();
  const [uploadingImage, setUploadingImage] = useState(false);
  const setCommunityStateValue = useSetRecoilState(communityState);
  const onUpdateImage = async () => {
    if (!selectedFile) return;
    setUploadingImage(true);
    try {
      const imageRef = ref(storage, `comunities/${communityData.id}/image`);
      await uploadString(imageRef, selectedFile, "data_url");
      const downloadURL = await getDownloadURL(imageRef);
      await updateDoc(doc(firestore, "communities", communityData.id), {
        imageURL: downloadURL,
      });

      setCommunityStateValue((prev) => {
        const id = prev.mySnippets.findIndex(
          (snippet) => snippet.communityId === communityData.id
        );
        const newSnippet: CommunitySnippet = {
          ...prev.mySnippets[id],
          imageURL: downloadURL,
        };
        // const newSnippets = prev.mySnippets
        //   .filter((snippet) => snippet.communityId !== communityData.id)
        //   .concat(newSnippet);
        const newSnippets = prev.mySnippets.map((snippet) => {
          if (snippet.communityId !== communityData.id) {
            return snippet;
          } else {
            return newSnippet;
          }
        });

        return {
          ...prev,
          currentCommunity: {
            ...prev.currentCommunity,
            imageURL: downloadURL,
          } as Community,
          mySnippets: newSnippets,
        };
      });
    } catch (error) {
      console.log("onUpdateImage Error", error);
    }
    setUploadingImage(false);
  };
  return (
    <Box position="sticky" top="14px">
      <Flex
        justify="space-between"
        align="center"
        bg="blue.400"
        color="white"
        p={3}
        borderRadius="4px 4px 0 0"
      >
        <Text fontSize="10pt" fontWeight={700}>
          About Community
        </Text>
        <Icon as={HiOutlineDotsHorizontal} />
      </Flex>
      <Flex direction="column" p={3} bg="white" borderRadius="0 0 4px 4px">
        <Stack>
          <Flex width="100%" p={2} fontSize="10pt" fontWeight={700}>
            <Flex direction="column" flexGrow={1}>
              <Text>{communityData.numberOfMembers.toLocaleString()}</Text>
              <Text>Members</Text>
            </Flex>
            <Flex direction="column" flexGrow={1}>
              <Text>1</Text>
              <Text>Online</Text>
            </Flex>
          </Flex>
          <Divider />
          <Flex
            align="center"
            width="100%"
            p={1}
            fontWeight={500}
            fontSize="10pt"
          >
            <Icon as={RiCakeLine} fontSize={18} mr={2} />
            {communityData.createdAt && (
              <Text>
                Created on{" "}
                {moment(
                  new Date(communityData.createdAt.seconds * 1000)
                ).format("LL")}
              </Text>
            )}
          </Flex>
          <Link href={`/r/${communityData.id}/submit`}>
            <Button mt={3} height="30px" width="100%">
              Create Post
            </Button>
          </Link>
          {user?.uid === communityData.creatorId && (
            <>
              <Divider />
              <Stack spacing={1} fontSize="10pt">
                <Text fontWeight={600}> Admin</Text>
                <Flex align="center" justify="space-between">
                  <Text
                    color="blue.500"
                    cursor="pointer"
                    _hover={{
                      textDecoration: "underLine",
                    }}
                    onClick={() => selectFileRef.current?.click()}
                  >
                    Change Image
                  </Text>
                  {communityData.imageURL || selectedFile ? (
                    <Image
                      src={selectedFile || communityData.imageURL}
                      borderRadius="full"
                      boxSize="40px"
                      alt="community Image"
                    />
                  ) : (
                    <Icon
                      as={FaReddit}
                      fontSize={40}
                      color="brand.100"
                      mr={2}
                    />
                  )}
                </Flex>
                {selectedFile &&
                  (uploadingImage ? (
                    <Spinner />
                  ) : (
                    <Text cursor="pointer" onClick={onUpdateImage}>
                      Save Changes
                    </Text>
                  ))}
                <input
                  id="file_upload"
                  type="file"
                  accept="image/x-png,image/gif,image/jpeg"
                  hidden
                  ref={selectFileRef}
                  onChange={onSelectFile}
                />
              </Stack>
            </>
          )}
        </Stack>
      </Flex>
    </Box>
  );
};
export default About;
