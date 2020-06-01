import React, { useState, useEffect } from "react";
import Moment from "moment";
import styled from "styled-components";
import {
  ActivityIndicator,
  RefreshControl,
  Platform,
  Alert,
  Linking,
} from "react-native";
import { Portal, Dialog, Paragraph, Button } from "react-native-paper";
import RNPickerSelect from "react-native-picker-select";
import { NavigationStackScreenComponent } from "react-navigation-stack";
import { useQuery, useMutation } from "react-apollo-hooks";
import Toast from "react-native-root-toast";
import { Formik } from "formik";
import * as Yup from "yup";
import { Notifications } from "expo";
import axios from "axios";
import Constants from "expo-constants";
import * as IntentLauncher from "expo-intent-launcher";
import * as Permissions from "expo-permissions";

import {
  ME,
  GET_FEED_LIST,
  GET_CLASS_LIST,
  GET_FEED_LIST_STAFF,
  CREATE_FEED,
  REMOVE_FEED,
} from "./MyProfileScreenQueries";
import {
  Me,
  GetFeedList,
  GetClassList,
  GetFeedListStaff,
  GetFeedListStaffVariables,
  CreateFeed,
  CreateFeedVariables,
  RemoveFeed,
  RemoveFeedVariables,
  RegisterPush,
  RegisterPushVariables,
} from "../../types/api";
import MyProfileHeader from "../../components/MyProfileHeader";

import UserStateController from "../../components/UserStateController";
import MenuCustomHeader from "../../components/MenuCustomHeader";
import FormikInput from "../../components/Formik/FormikInput";
import { REGISTER_PUSH } from "./MyProfileScreenQueries";

const LoadingContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;
const View = styled.View`
  flex: 1;
  min-height: 100px;
  align-items: center;
  justify-content: center;
  padding: 10px 20px 20px 20px;
`;
const GreyLine = styled.View`
  margin: 0 20px;
  border-bottom-width: 0.5px;
  border-bottom-color: #999;
`;
const Row = styled.View`
  flex: 1;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;
const FeedHeader = styled.Text`
  font-weight: 600;
`;
const DateFont = styled.Text`
  font-size: 10px;
`;
const Text = styled.Text`
  font-size: 14px;
  font-weight: 100;
`;
const ScrollView = styled.ScrollView``;
const Circle = styled.Text`
  text-align: center;
  margin-top: 20px;
  font-size: 8px;
  color: #999;
  margin-bottom: 50px;
`;
const ButtonContainer = styled.View`
  align-items: center;
  margin-bottom: 10px;
`;
const DialogButtonContainer = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  margin-right: 10px;
  margin-bottom: 10px;
`;

const MyProfileScreen: NavigationStackScreenComponent = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [classOrderUuid, setClassOrderUuid] = useState<string>(null);
  const [createFeedModalOpen, setCreateFeedModalOpen] = useState<boolean>(
    false
  );
  const [removeFeedModalOpen, setRemoveFeedModalOpen] = useState<boolean>(
    false
  );
  const [feedUuid, setFeedUuid] = useState<string>("");
  const {
    data: { me: { user: me = null } = {} } = {},
    loading: meLoading,
    refetch: meRefetch,
  } = useQuery<Me>(ME);
  const {
    data: { getFeedList: { feeds = null } = {} } = {},
    loading: getFeedListLoading,
    refetch: getFeedListRefetch,
  } = useQuery<GetFeedList>(GET_FEED_LIST, {});
  const {
    data: { getFeedListStaff: { feeds: feedsStaff = null } = {} } = {},
    loading: getFeedListStaffLoading,
    refetch: getFeedListStaffRefetch,
  } = useQuery<GetFeedListStaff, GetFeedListStaffVariables>(
    GET_FEED_LIST_STAFF,
    {
      variables: { classOrderUuid },
    }
  );
  const [createFeedFn, { loading: createFeedLoading }] = useMutation<
    CreateFeed,
    CreateFeedVariables
  >(CREATE_FEED, {
    refetchQueries: [
      {
        query: GET_FEED_LIST_STAFF,
        variables: { classOrderUuid },
      },
    ],
  });
  const [removeFeedFn, { loading: removeFeedLoading }] = useMutation<
    RemoveFeed,
    RemoveFeedVariables
  >(REMOVE_FEED, {
    refetchQueries: [
      {
        query: GET_FEED_LIST_STAFF,
        variables: { classOrderUuid },
      },
    ],
  });
  const [registerPushFn, { loading: registerPushLoading }] = useMutation<
    RegisterPush,
    RegisterPushVariables
  >(REGISTER_PUSH);
  const {
    data: { getClassList: { classes = null } = {} } = {},
    loading: getClassListLoading,
  } = useQuery<GetClassList>(GET_CLASS_LIST);
  const toast = (message: string) => {
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      position: Toast.positions.CENTER,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  };
  const createFeedConfirm = async (values) => {
    const {
      data: { createFeed },
    } = await createFeedFn({
      variables: {
        classOrderUuid,
        text: values.text,
      },
    });
    if (createFeed.feed) {
      const classUsers = [];
      createFeed.users.map((user: any) => {
        classUsers.push(user.pushToken);
        console.log("AMHERE");
      });
      await axios.post("https://exp.host/--/api/v2/push/send", {
        to: classUsers,
        title: "새로운 공지",
        body: `몸공부 ${createFeed.feed.classOrder.order}기 ${me.firstName}: 새로운 공지가 게시되었습니다. `,
      });
      console.log("DONE");
    }
    setCreateFeedModalOpen(false);
    toast("공지를 게시하였습니다.");
  };
  const removeFeedConfirm = () => {
    removeFeedFn({
      variables: {
        feedUuid,
      },
    });
    setRemoveFeedModalOpen(false);
    toast("공지를 삭제하였습니다.");
  };
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await meRefetch();
      await getFeedListRefetch();
      await getFeedListStaffRefetch();
    } catch (e) {
      console.log(e);
    } finally {
      setRefreshing(false);
    }
  };
  const askPermission = async () => {
    const { status: notificationStatus } = await Permissions.askAsync(
      Permissions.NOTIFICATIONS
    );
    console.log("notificationStatus", notificationStatus);
    if (Platform.OS === "ios" && notificationStatus === "denied") {
      Alert.alert(
        "Permission Denied",
        "To enable notification, tap Open Settings, then tap on Notifications, and finally tap on Allow Notifications.",
        [
          {
            text: "취소",
            style: "cancel",
          },
          {
            text: "확인",
            onPress: () => {
              Linking.openURL("app-settings:");
            },
          },
        ]
      );
    } else if (Platform.OS === "android" && notificationStatus === "denied") {
      Alert.alert(
        "Permission Denied",
        "To enable notification, tap Open Settings, then tap on Notifications, and finally tap on Show notifications.",
        [
          {
            text: "취소",
            style: "cancel",
          },
          {
            text: "확인",
            onPress: () => {
              const pkg = Constants.manifest.releaseChannel
                ? Constants.manifest.android.package
                : "host.exp.exponent";
              IntentLauncher.startActivityAsync(
                IntentLauncher.ACTION_APPLICATION_DETAILS_SETTINGS,
                { data: "package:" + pkg }
              );
            },
          },
        ]
      );
    } else if (notificationStatus === "granted") {
      let pushToken = await Notifications.getExpoPushTokenAsync();
      const { data: serverData } = await registerPushFn({
        variables: { pushToken },
      });
      console.log("serverData", serverData);
    } else {
      return;
    }
  };
  useEffect(() => {
    askPermission();
  }, []);
  if (
    meLoading ||
    getFeedListLoading ||
    getFeedListStaffLoading ||
    getClassListLoading
  ) {
    return (
      <LoadingContainer>
        <ActivityIndicator />
      </LoadingContainer>
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
            order={me.classOrder && me.classOrder.order}
            startDate={me.classOrder && me.classOrder.startDate}
            endDate={me.classOrder && me.classOrder.endDate}
            isStaff={me.isStaff}
            name={`${me.lastName} ${me.firstName}`}
            username={me.username}
          />
          {(() => {
            switch (me.isStaff) {
              case true:
                return (
                  <>
                    <Formik
                      initialValues={{ text: "" }}
                      onSubmit={() => {}}
                      validationSchema={Yup.object().shape({
                        text: Yup.string(),
                      })}
                    >
                      {({
                        values,
                        setFieldValue,
                        setFieldTouched,
                        touched,
                        errors,
                        isValid,
                      }) => (
                        <>
                          <Portal>
                            <Dialog
                              visible={createFeedModalOpen}
                              onDismiss={() => setCreateFeedModalOpen(false)}
                            >
                              <Dialog.Title>알림</Dialog.Title>
                              <Dialog.Content>
                                <Paragraph>공지를 게시하시겠습니까?</Paragraph>
                              </Dialog.Content>
                              <Dialog.Actions>
                                <DialogButtonContainer>
                                  <Button
                                    disabled={createFeedLoading}
                                    color="#0000ff"
                                    onPress={() =>
                                      setCreateFeedModalOpen(false)
                                    }
                                  >
                                    취소
                                  </Button>
                                  <Button
                                    disabled={createFeedLoading}
                                    color="#0000ff"
                                    onPress={() => createFeedConfirm(values)}
                                  >
                                    게시
                                  </Button>
                                </DialogButtonContainer>
                              </Dialog.Actions>
                            </Dialog>
                          </Portal>
                          <RNPickerSelect
                            onValueChange={(value) => {
                              setClassOrderUuid(value);
                            }}
                            value={classOrderUuid}
                            style={{
                              inputIOS: {
                                margin: 20,
                                fontSize: 16,
                                paddingVertical: 12,
                                paddingHorizontal: 10,
                                borderWidth: 1,
                                borderColor: "gray",
                                borderRadius: 4,
                                backgroundColor: "#fff",
                                color: "black",
                                paddingRight: 30,
                                textAlign: "center",
                              },
                              inputAndroid: {
                                borderWidth: 1,
                                borderColor: "gray",
                                borderRadius: 4,
                                backgroundColor: "#fff",
                                color: "black",
                              },
                            }}
                            placeholder={{
                              label: "기수를 선택하세요.",
                            }}
                            pickerProps={{
                              style: {
                                marginLeft: 20,
                                marginRight: 20,
                              },
                            }}
                            items={
                              classes &&
                              classes.length !== 0 &&
                              classes.map((classe: any) => ({
                                key: classe.uuid.toString(),
                                label:
                                  classe.order.toString() +
                                  " 기 - " +
                                  Moment(classe.startDate).format("M월 D일") +
                                  " ~ " +
                                  Moment(classe.endDate).format("M월 D일"),
                                value: classe.uuid.toString(),
                              }))
                            }
                          />
                          {classOrderUuid && classOrderUuid.length !== 0 && (
                            <>
                              <FormikInput
                                label={"공지를 입력하세요"}
                                value={values.text}
                                onChange={setFieldValue}
                                onTouch={setFieldTouched}
                                name="text"
                                error={touched.text && errors.text}
                                multiline={true}
                              />
                              <ButtonContainer>
                                <Button
                                  color="#0000ff"
                                  disabled={!values.text || createFeedLoading}
                                  onPress={() => setCreateFeedModalOpen(true)}
                                >
                                  게시
                                </Button>
                              </ButtonContainer>
                            </>
                          )}
                        </>
                      )}
                    </Formik>
                    <GreyLine />
                    {feedsStaff &&
                      feedsStaff.length !== 0 &&
                      feedsStaff.map((feed: any) => (
                        <React.Fragment key={feed.uuid}>
                          <Portal>
                            <Dialog
                              visible={removeFeedModalOpen}
                              onDismiss={() => setRemoveFeedModalOpen(false)}
                            >
                              <Dialog.Title>알림</Dialog.Title>
                              <Dialog.Content>
                                <Paragraph>
                                  공지를 삭제한 후에는 되돌릴 수 없습니다.
                                </Paragraph>
                                <Paragraph>삭제하시겠습니까?</Paragraph>
                              </Dialog.Content>
                              <Dialog.Actions>
                                <DialogButtonContainer>
                                  <Button
                                    color="#0000ff"
                                    onPress={() =>
                                      setRemoveFeedModalOpen(false)
                                    }
                                    disabled={removeFeedLoading}
                                  >
                                    취소
                                  </Button>
                                  <Button
                                    color={"red"}
                                    onPress={() => removeFeedConfirm()}
                                    disabled={removeFeedLoading}
                                  >
                                    삭제
                                  </Button>
                                </DialogButtonContainer>
                              </Dialog.Actions>
                            </Dialog>
                          </Portal>
                          <View>
                            <Row>
                              <FeedHeader>{feed.user.username}</FeedHeader>
                              <DateFont>
                                {Moment(feed.createdAt).format("Y년 M월 D일")}
                              </DateFont>
                            </Row>
                            <Text>{feed.text}</Text>
                          </View>
                          <ButtonContainer>
                            <Button
                              disabled={removeFeedLoading}
                              onPress={() => {
                                setRemoveFeedModalOpen(true),
                                  setFeedUuid(feed.uuid);
                              }}
                              color={"red"}
                            >
                              삭제
                            </Button>
                          </ButtonContainer>
                          <GreyLine />
                        </React.Fragment>
                      ))}
                  </>
                );
              default:
                return (
                  <>
                    {me.hasSubmittedPreviousCheckList &&
                    me.hasSubmittedApplication &&
                    me.hasPaid ? (
                      <>
                        {feeds &&
                          feeds.length !== 0 &&
                          feeds.map((feed: any) => (
                            <React.Fragment key={feed.uuid}>
                              <View>
                                <Row>
                                  <FeedHeader>{feed.user.username}</FeedHeader>
                                  <DateFont>
                                    {Moment(feed.createdAt).format(
                                      "Y년 M월 D일"
                                    )}
                                  </DateFont>
                                </Row>
                                <Text>{feed.text}</Text>
                              </View>
                              <GreyLine />
                            </React.Fragment>
                          ))}
                      </>
                    ) : (
                      <UserStateController />
                    )}
                  </>
                );
            }
          })()}
          <Circle>●</Circle>
        </ScrollView>
      </>
    );
  }
};
MyProfileScreen.navigationOptions = () => ({});

export default MyProfileScreen;
