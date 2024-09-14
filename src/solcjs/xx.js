var solc = require('solc');

// getting the development snapshot
solc.loadRemoteVersion('latest', function(err, solcSnapshot) {
  if (err) {
    console.error('getSnapshot failed', err);
  } else {
    console.log('getSnapshot succeed', solcSnapshot.version());
  }
});