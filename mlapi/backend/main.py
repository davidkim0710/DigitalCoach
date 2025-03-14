"""
Main entry point for the backend application.
"""
import logging
from backend.server.app import app
from backend.utils import move_misplaced_files

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Check for and move misplaced temporary files on startup
move_misplaced_files()

# Application server WSGI entry point
application = app

if __name__ == "__main__":
    # Only use Flask's development server when running directly
    logger.info("Starting development server")
    app.run(debug=False, host="0.0.0.0", port=5000)