import streamlit as st
import streamlit.components.v1 as components
import os

st.set_page_config(
    page_title="ATS Resume Generator — Strict 1-Page A4",
    page_icon="📄",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# Seamless full-window styling
st.markdown(
    """
    <style>
        /* Hide Streamlit default padding and chrome */
        #MainMenu {visibility: hidden;}
        footer {visibility: hidden;}
        header {visibility: hidden;}
        .block-container {
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
            max-width: 100% !important;
        }
        iframe {
            border: 1px solid #e2e8f0 !important;
            border-radius: 12px !important;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
            width: 100% !important;
        }
    </style>
    """,
    unsafe_allow_html=True,
)

# Check if static build exists locally
static_index_path = os.path.join(os.path.dirname(__file__), "static", "index.html")

# Render ATS Resume Generator
if os.path.exists(static_index_path):
    components.iframe(src="app/static/index.html", height=1100, scrolling=True)
else:
    # Hosted fallback
    components.iframe(
        src="https://bokkakoushal9999-coder.github.io/ATS-Resume-Generator/",
        height=1100,
        scrolling=True,
    )
