import React from "react";
import { useIntl } from "react-intl";
import { FormattedMessage } from "react-intl";
import MyButton from "../button/button";

export default function SecondBookMark({
  setSpan,
  diacritical,
  setDiacritical,
  spellChecking,
  setSpellChecking,
  handleDailyGoalChange,
  newDailyGoal,
  saveSettings,
}) {
  const intl = useIntl();

  return (
    <>
      {/* Diacritical marks */}
      <div
        className="switch-container onMouse"
        onMouseEnter={() => setSpan("diacritical")}
      >
        <span className="switch-text">
          <FormattedMessage
            id="switches.diacritical"
            defaultMessage="Diacritical marks"
          />
        </span>
        <label className="switch">
          <input
            onClick={() => setDiacritical(!diacritical)}
            defaultChecked={diacritical === false}
            type="checkbox"
          />
          <span className="slider round"></span>
        </label>
      </div>

      {/* Margin of error */}
      <div
        className="switch-container onMouse"
        onMouseEnter={() => setSpan("spellChecking")}
      >
        <span className="switch-text">
          <FormattedMessage
            id="switches.spellChecking"
            defaultMessage="Margin of error"
          />
        </span>
        <label className="switch">
          <input
            onClick={() => setSpellChecking(!spellChecking)}
            defaultChecked={spellChecking === true}
            type="checkbox"
          />
          <span className="slider round"></span>
        </label>
      </div>

      {/* Daily Goal */}
      <div
        className="dailyGoal onMouse"
        onMouseEnter={() => setSpan("DailyGoal")}
      >
        <span className="switch-text">
          <FormattedMessage
            id="dailyProgress"
            defaultMessage="Daily Progress"
          />
        </span>
        <input
          type="number"
          value={newDailyGoal}
          onChange={handleDailyGoalChange}
        />
      </div>

      {/* Save Button */}
      <div className="resets-buttons resets-buttons-bottom">
        <MyButton
          message={
            <FormattedMessage
              id="saveSettings"
              defaultMessage="Save Settings"
            />
          }
          color="red"
          onClick={() => saveSettings()}
        />
      </div>
    </>
  );
}
