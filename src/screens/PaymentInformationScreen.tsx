import React from "react";
import { ImageBackground, ScrollView } from "react-native";
import styled from "styled-components";
import { NavigationStackScreenComponent } from "react-navigation-stack";
import dimensions from "../constants/dimensions";
import { withNavigation } from "react-navigation";
import { Ionicons } from "@expo/vector-icons";

const Container = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.3);
  align-items: center;
  justify-content: flex-start;
`;
const View = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
`;
const WhiteSpace = styled.View`
  height: 30px;
`;
const Text = styled.Text`
  color: white;
  font-size: 14px;
  margin-bottom: 12px;
`;
const Bold = styled(Text)`
  font-size: 18px;
  font-weight: 500;
`;
const TitleBox = styled.View`
  margin-top: 100px;
  align-items: center;
`;
const Title = styled(Text)`
  font-weight: 400;
  font-size: 28px;
`;
const IconContainer = styled.TouchableOpacity`
  position: absolute;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  top: 45px;
  left: 10px;
  z-index: 10;
`;
export default () => {
  const LeftComponent = withNavigation(({ navigation }) => {
    return (
      <IconContainer onPress={() => navigation.goBack()}>
        <Ionicons size={24} name={"ios-menu"} color={"white"} />
      </IconContainer>
    );
  });
  return (
    <ImageBackground
      style={{ width: "100%", height: "100%" }}
      source={require("../images/AboutImages/FifthPage.jpg")}
      resizeMode="stretch"
    >
      <Container>
        <ScrollView style={{ width: dimensions.width }}>
          <LeftComponent />
          <TitleBox>
            <Title>몸공부 일정과 비용, 신청방법</Title>
          </TitleBox>
          <WhiteSpace />
          <WhiteSpace />
          <View>
            <Bold>일시</Bold>
            <Text>낮반 : 월, 수, 금 11:00 ~ 14:00 총 6회</Text>
            <Text>저녁반: 화, 목, 토 늦은 7:30 ~ 늦은 10:00 </Text>
            <WhiteSpace />
            <Bold>장소</Bold>
            <Text>고마스쿨 교육관 (자하누리)</Text>
            <WhiteSpace />
            <Bold>참가비</Bold>
            <Text>45만원</Text>
            <WhiteSpace />
            <Bold>입금계좌</Bold>
            <Text>우리 은행 1002-050-722288</Text>
            <Text>장진기 (카드 결제 가능 링크)</Text>
            <WhiteSpace />
            <Bold>신청</Bold>
            <Text>신청링크 들어가서 신청서 작성후 참가비 입금</Text>
            <WhiteSpace />
            <Bold>신청/문의</Bold>
            <Text>02-876-2236 / 010-4052-2236</Text>
            <Text>카카오톡 @자하누리</Text>
            <WhiteSpace />
            <Text>
              1:1 관리로 이루어지는 프로그램 특성상 소수 정예로 진행됩니다.
            </Text>
            <Text>인원 제한이 있으니 신청을 서둘러주세요. </Text>
            <WhiteSpace />
            <WhiteSpace />
            <WhiteSpace />
          </View>
        </ScrollView>
      </Container>
    </ImageBackground>
  );
};
