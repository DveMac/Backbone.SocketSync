var loadTemplate = function(el, id){
    var view = $(id).clone();
    view.removeClass('hdn');
    $(el).html(view);
}


// Models

var Note = Backbone.Model.extend({
  url: '/notes',
  defaults:{
    title: 'title',
    content: 'content'
  }
});

// Collections

var Notes = Backbone.Collection.extend({
  url: '/notes',
  model: Note
});

// Views

var NoteView = Backbone.View.extend({
  tagName: 'li',

  attributes: {
    'class': 'pd5'
  },

  events:{
    'click #note_save_button': 'onSaveClick',
    'focus input': 'onInputFocus'
  },

  initialize: function() {
    _.bindAll(this, 'render', 'onSaveClick');
    this.model.bind('change', this.render);
  },

  render: function(){
    loadTemplate(this.el, '#note_view');

    Backbone.ModelBinding.bind(this);

    return this;
  },

  onSaveClick: function() {

    this.model.set({
      title: $('#note_title').val(),
      content: $('#note_content').val()
    }, { silent: true });

    this.model.save(this.model.toJSON(),{
      success: function(data){
        console.log(data);
      }
    });
  },

  onInputFocus: function(a,b,c){
  }

});

var NoteListView = Backbone.View.extend({
  el: $('#main'),

  events:{
    'click #note_add_button': 'onAddNoteClick'
  },

  initialize: function(){
    _.bindAll(this, 'render', 'onAddNoteClick', 'addItemToView');

    this.collection = new Notes();
    this.collection.bind('add', this.addItemToView);
    this.collection.bind('reset', this.render);
    this.render();

    this.collection.fetch();
  },

  render: function(){
    loadTemplate(this.el, '#note_list_view');

    _(this.collection.models).each(function(m){
      this.addItemToView(m);
    }, this);

    return this;
  },

  onAddNoteClick: function(){
    var note = new Note();
    this.collection.add(note);
  },

  addItemToView: function(note){
    var noteView = new NoteView({model:note});
    var view = noteView.render();
    $('ul', this.el).append(view.el);
  }
});