const API_URL = 'https://make100-backend.rotanovav.workers.dev';
async function test() {
  const res = await fetch(`${API_URL}/api/user`, {
    headers: {
      // simulate initData for @RotanovAV if we had it, but we don't.
      // wait, how does the user authenticate?
    }
  });
  console.log(res.status, await res.text());
}
test();
