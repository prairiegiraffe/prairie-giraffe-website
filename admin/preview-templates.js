// Preview templates disabled temporarily to fix initialization issues
// Will be re-enabled once CMS is working properly

/*
// Preview template for blog posts
var BlogPostPreview = createClass({
  render: function() {
    var entry = this.props.entry;
    var title = entry.getIn(['data', 'title']);
    var body = entry.getIn(['data', 'body']);
    var author = entry.getIn(['data', 'author']);
    var date = entry.getIn(['data', 'date']);
    var category = entry.getIn(['data', 'category']);
    
    return h('div', {},
      h('h1', {}, title),
      h('div', {className: 'meta'},
        h('span', {}, 'By ' + author + ' | '),
        h('span', {}, date ? date.format('MMMM D, YYYY') : ''),
        h('span', {}, ' | ' + category)
      ),
      h('div', {dangerouslySetInnerHTML: {__html: this.props.widgetFor('body')}})
    );
  }
});

// Register the preview template
CMS.registerPreviewTemplate('blog', BlogPostPreview);
*/