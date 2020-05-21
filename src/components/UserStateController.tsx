import React from "react";
import styled from "styled-components";
import { useMe } from "../context/meContext";
import { ActivityIndicator } from "react-native";
import { withNavigation } from "react-navigation";

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
const DateFont = styled.Text`
  font-size: 10px;
`;
const Text = styled.Text`
  font-size: 16px;
  margin-bottom: 10px;
`;
const Touchable = styled.TouchableOpacity``;

export default withNavigation(({ navigation }) => {
  const { me, loading } = useMe();
  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        style={{
          margin: 20,
        }}
      />
    );
  } else {
    if (!me.user.hasSubmitedApplication) {
      return (
        <>
          <View>
            <Text>아직 신청서를 제출하지 않았습니다.</Text>
            <Touchable onPress={() => navigation.push("ApplicationScreen")}>
              <DateFont>신청서를 제출하려면 여기를 탭하세요.</DateFont>
            </Touchable>
          </View>
          <GreyLine />
        </>
      );
    } else if (!me.user.hasPaid) {
      return (
        <>
          <View>
            <Text>아직 결제를 하지 않았습니다.</Text>
            <Touchable
              onPress={() => navigation.push("PaymentInformationScreen")}
            >
              <DateFont>결제 정보를 보려면 여기를 탭하세요.</DateFont>
            </Touchable>
          </View>
          <GreyLine />
        </>
      );
    } else if (!me.user.hasPreviousCheckListSubmitted) {
      return (
        <>
          <View>
            <Text>체크리스트를 제출하지 않았습니다.</Text>
            <Touchable onPress={() => navigation.push("CheckListScreen")}>
              <DateFont>체크리스트를 제출하려면 여기를 탭하세요.</DateFont>
            </Touchable>
          </View>
          <GreyLine />
        </>
      );
    } else {
      return null;
    }
  }
});
