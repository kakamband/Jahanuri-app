import React, { useState } from "react";
import { ActivityIndicator, RefreshControl } from "react-native";

import { ME, GET_FEED_LIST } from "./MyProfileScreenQueries";
import { Me, GetFeedList } from "../../types/api";
import MyProfileHeader from "../../components/MyProfileHeader";
import styled from "styled-components";
import UserStateController from "../../components/UserStateController";
import MenuCustomHeader from "../../components/MenuCustomHeader";
import { NavigationStackScreenComponent } from "react-navigation-stack";
import { useQuery } from "react-apollo-hooks";

const View = styled.View`
  min-height: 100px;
  align-items: center;
  justify-content: center;
`;
const GreyLine = styled.View`
  margin: 0 20px;
  border-bottom-width: 1px;
  border-bottom-color: red;
`;

const Text = styled.Text``;
const ScrollView = styled.ScrollView``;

const MyProfileScreen: NavigationStackScreenComponent = () => {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const {
    data: { me: { user: me = null } = {} } = {},
    loading: meLoading,
    refetch: meRefetch,
  } = useQuery<Me>(ME);
  const {
    data: { getFeedList: { feeds = null } = {} } = {},
    loading: getFeedLoading,
    refetch: getFeedRefetch,
  } = useQuery<GetFeedList>(GET_FEED_LIST);
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await meRefetch();
      await getFeedRefetch();
    } catch (e) {
      console.log(e);
    } finally {
      setRefreshing(false);
    }
  };
  if (meLoading || getFeedLoading) {
    return (
      <ActivityIndicator
        size="large"
        style={{
          margin: 20,
        }}
      />
    );
  } else {
    return (
      <>
        <MenuCustomHeader title={"나의 프로필"} />
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={"#999"}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <MyProfileHeader
            userImg={me.userImg}
            name={`${me.firstName} ${me.lastName}`}
            username={me.username}
            bio={me.bio}
          />
          {me.hasPreviousCheckListSubmitted &&
          me.hasSubmitedApplication &&
          me.hasPaid ? (
            <>
              {feeds.map((feed: any) => (
                <View key={feed.uuid}>
                  <Text>{feed.text}</Text>
                  <GreyLine />
                  <Text>{feed.createdAt}</Text>
                </View>
              ))}
            </>
          ) : (
            <UserStateController />
          )}
        </ScrollView>
      </>
    );
  }
};
MyProfileScreen.navigationOptions = () => ({});

export default MyProfileScreen;
