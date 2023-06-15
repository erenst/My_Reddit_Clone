import { NextPage } from "next";
import PageContent from "../components/Layout/PageContent";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/clientApp";
import { useEffect } from "react";

const Home: NextPage = () => {
  const [user, loadingUser] = useAuthState(auth);
  const buildUserHomeFeed = () => {};
  const buildNoUserHomeFeed = () => {};
  const getUserPostVotes = () => {};

  useEffect(() => {
    if (!user && !loadingUser) buildNoUserHomeFeed();
  }, [user, loadingUser]);
  return (
    <PageContent>
      <>{/* PostFeed */}</>
      <>{/* Recommendations */}</>
    </PageContent>
  );
};

export default Home;
