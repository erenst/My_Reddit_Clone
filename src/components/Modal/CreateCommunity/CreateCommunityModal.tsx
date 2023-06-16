import { auth, firestore } from "@/src/firebase/clientApp";
import useDirectory from "@/src/hooks/useDirectory";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Box,
  Divider,
  Text,
  Input,
  Stack,
  Checkbox,
  Flex,
  Icon,
  transition,
} from "@chakra-ui/react";
import { async } from "@firebase/util";
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useRouter } from "next/router";

import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { BsFillEyeFill, BsFillPersonFill } from "react-icons/bs";
import { HiLockClosed } from "react-icons/hi";
type CreateCommunityModalProps = {
  open: boolean;
  handleClose: () => void;
};

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  open,
  handleClose,
}) => {
  const [user] = useAuthState(auth);
  const [communityName, setCommunityName] = useState("");
  const [charsRemaining, setCharsRemaining] = useState(21);
  const [communityType, setCommunityType] = useState("public");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toggleMenuOpen } = useDirectory();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length > 21) return;
    setCommunityName(event.target.value);
    setCharsRemaining(21 - event.target.value.length);
  };
  const onCommunityTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCommunityType(event.target.name);
  };

  const handleCreateCommunity = async () => {
    if (error) setError("");
    //validate the community name
    const format = /[ `!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?~]/;
    if (format.test(communityName) || communityName.length < 3) {
      setError(
        "Community names must be between 3-21 characters, and only contain letters, numbers, or underscores"
      );
      return;
    }

    setLoading(true);
    //create the cummunity document in firestore

    try {
      const communityDocRef = doc(firestore, "communities", communityName);
      await runTransaction(firestore, async (transaction) => {
        //Check if community exists in db
        const communityDoc = await transaction.get(communityDocRef);
        if (communityDoc.exists()) {
          throw new Error(
            `Sorry, r/${communityName} is already token, try another.`
          );
        }
        //if valid name, create community
        transaction.set(communityDocRef, {
          creatorId: user?.uid,
          createdAt: serverTimestamp(),
          numberOfMembers: 1,
          privacyType: communityType,
        });
        transaction.set(
          doc(firestore, `users/${user?.uid}/communitySnippets`, communityName),
          {
            communityId: communityName,
            isModerator: true,
          }
        );
      });

      // setCommunityName("");
      // setCommunityType("public");
      // setCharsRemaining(21);
      handleClose();
      toggleMenuOpen();
      router.push(`r/${communityName}`);
    } catch (e) {
      console.error("handleCreateCommunityError:", e);
      if (typeof e === "string") {
        setError(e.toUpperCase()); // works, `e` narrowed to string
      } else if (e instanceof Error) {
        setError(e.message); // works, `e` narrowed to Error
      }
    }
    setLoading(false);
  };
  return (
    <Modal isOpen={open} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          display="flex"
          flexDirection="column"
          fontSize={15}
          padding={3}
        >
          Create a community
        </ModalHeader>
        <Box pr={3} pl={3}>
          <Divider />
          <ModalCloseButton />
          <ModalBody display="flex" flexDirection="column" padding="10px 0">
            <Text fontWeight={600} fontSize={15}>
              Name
            </Text>
            <Text fontSize={11} color="gray.500">
              Community names including capitalization cannot be changed
            </Text>
            <Text
              position="relative"
              top="28px"
              left="10px"
              width="20px"
              color="gray.400"
            >
              r/
            </Text>
            <Input
              value={communityName}
              size="sm"
              pl="22px"
              position="relative"
              onChange={handleChange}
            />
            <Text
              color={charsRemaining === 0 ? "red" : "gray.500"}
              fontSize="9pt"
            >
              {charsRemaining} Character remaining
            </Text>
            <Text fontSize="9pt" color="red" pt={1}>
              {error}
            </Text>
            <Box mt={4} mb={4}>
              <Text fontWeight={600} fontSize={15}>
                Community Type
              </Text>
              <Stack spacing={2}>
                <Checkbox
                  name="public"
                  isChecked={communityType === "public"}
                  onChange={onCommunityTypeChange}
                >
                  <Flex align="center">
                    <Icon as={BsFillPersonFill} color="gray.500" mr={2} />
                    <Text fontSize="10pt" mr={1}>
                      Public
                    </Text>
                    <Text fontSize="8pt" pt={1} pl={1} color="gray.500">
                      Anyone can view, post, and comment to this community.
                    </Text>
                  </Flex>
                </Checkbox>
                <Checkbox
                  name="restricted"
                  isChecked={communityType === "restricted"}
                  onChange={onCommunityTypeChange}
                >
                  <Flex align="center">
                    <Icon as={BsFillEyeFill} color="gray.500" mr={2} />
                    <Text fontSize="10pt" mr={1}>
                      Restricted
                    </Text>
                    <Text fontSize="8pt" pt={1} pl={1} color="gray.500">
                      Anyone can view this community,but only approved users can
                      post.
                    </Text>
                  </Flex>
                </Checkbox>
                <Checkbox
                  name="private"
                  isChecked={communityType === "private"}
                  onChange={onCommunityTypeChange}
                >
                  <Flex align="center">
                    <Icon as={HiLockClosed} color="gray.500" mr={2} />
                    <Text fontSize="10pt" mr={1}>
                      Private
                    </Text>
                    <Text fontSize="8pt" pt={1} pl={1} color="gray.500">
                      Only approved users can view, post, and submit to this
                      community.
                    </Text>
                  </Flex>
                </Checkbox>
              </Stack>
            </Box>
          </ModalBody>
        </Box>

        <ModalFooter bg="gray.100" borderRadius="0 0 10px 10px">
          <Button variant="outline" height="30px" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            height="30px"
            onClick={handleCreateCommunity}
            isLoading={loading}
          >
            Create Community
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
export default CreateCommunityModal;
