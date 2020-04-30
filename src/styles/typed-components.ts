import * as styledComponents from "styled-components";
import { ThemedStyledComponentsModule } from "styled-components";

interface IThemeInterface {
  headerColor: string;
  bgColor: string;
  greyColor: string;
  darkGreyColor: string;
  blueColor: string;
  whiteColor: string;
  color: string;
  boxBorder: string;
  darkBlueColor: string;
  lightGreyColor: string;

}

const {
  default: styled,
  css,
  ThemeProvider
} = styledComponents as ThemedStyledComponentsModule<IThemeInterface>;

export { css, ThemeProvider };
export default styled;
