import { TrackerTestPage } from './app.po';

describe('tracker-test App', function() {
  let page: TrackerTestPage;

  beforeEach(() => {
    page = new TrackerTestPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
