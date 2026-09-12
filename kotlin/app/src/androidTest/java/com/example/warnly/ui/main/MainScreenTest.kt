package com.example.warnly.ui.main

import androidx.activity.ComponentActivity
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import com.example.warnly.theme.WarnlyTheme
import com.example.warnly.ui.WarnlyApp

/** UI instrumented smoke test for Warnly. */
class MainScreenTest {

  @get:Rule val composeTestRule = createAndroidComposeRule<ComponentActivity>()

  @Before
  fun setup() {
    composeTestRule.setContent {
      WarnlyTheme {
        WarnlyApp()
      }
    }
  }

  @Test
  fun appHeader_exists() {
    composeTestRule.onNodeWithText("WARNLY").assertExists()
  }
}
