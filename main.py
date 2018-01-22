from flask import Flask, render_template

app = Flask(__name__)
app.config.from_object(__name__)
app.config.from_pyfile('./instance/config.cfg', silent=True)

MAPBOX_ACCESS_TOKEN = app.config['MAPBOX_ACCESS_TOKEN']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/gl.html')
def gl():
	return render_template('gl.html', 
        MAPBOX_ACCESS_TOKEN=MAPBOX_ACCESS_TOKEN)

# if __name__ == "__main__":
#     app.run()

# @app.errorhandler(500)
# def server_error(e):
#     logging.exception('An error occurred during a request.')
#     return 'An internal error occurred.', 500