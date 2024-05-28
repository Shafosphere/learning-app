import "./settings.css";
export default function Settings() {
  return (
    <>
      <div className="container-settings">
        <div className="window-settings">
          <div className="switches">

            <div className="switch-container">
              <span className="switch-text">Sounds</span>
              <label class="switch">
                <input type="checkbox" />
                <span class="slider round"></span>
              </label>
            </div>


            <div className="switch-container">
              <span className="switch-text">B2</span>
              <label class="switch">
                <input type="checkbox" />
                <span class="slider round"></span>
              </label>
              <span className="switch-text">C1</span>
              <label class="switch">
                <input type="checkbox" />
                <span class="slider round"></span>
              </label>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
