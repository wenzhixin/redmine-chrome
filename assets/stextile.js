function Textile() {
  // Options
  this.indentSize = 2;

  // State
  this.inList = 0;
  this.listTypes = [];
  this.inPreformattedBlock = 0;
  this.inExistingBlock = 0;
  this.inPreformattedContent = false;
  this.inTable = 0;

  // Transforms
  this.quotes = {
      startDoubleQuote: '&#8220;'
    , endDoubleQuote: '&#8221;'
    , startSingleQuote: '&#8216;'
    , endSingleQuote: '&#8217;'
  };

  this.entities = {
      apostrophe: ["'", '&#8217;']
    , doubleHyphen: ['--', '&#8212;']
    , singleHyphen: ['-', '&#8211;']
    , ellipsis: ['\\.\\.\\.', '&#8230;']
  };
}

Textile.prototype = {
  parse: function(text) {
    if (!text) return;

    var lines = text.split(/\n|\r\n/)
      , line
      , result = '';

    for (var i = 0; i < lines.length; i++) {
      line = lines[i];

      if (this.inList && !this.matchList(line)) {
        var listType = this.popListType();
        result += this.indent(this.inPreformattedContent) + '</li>\n</' + listType + '>\n';
        this.inList--;
      }

      if (this.inTable && !this.matchTable(line)) {
        result += '</table>\n';
        this.inTable--;
      }

      this.preformattedBlockStart(line);

      if (!this.inPreformattedBlock) {
        result += (
             this.headers(line)
          || this.blockquotes(line)
          || this.lists(line)
          || this.tables(line)
          || this.paragraphs(line)
          || '');
      } else {
        this.preformattedBlockEnd(line);

        if (this.inPreformattedContent) {
          line = this.escapeHTML(line) + '\n';
        } else {
          line = line + '\n';
        }
        result += line || '';
        this.inPreformattedContent = true;
      }
      
    }
    return result;
  },

  indent: function(level) {
    return (new Array(level * this.indentSize)).join(' ');
  },

  escapeHTML: function(text) {
    return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  },

  preformattedBlockStart: function(text) {
    var blockStart = text.match(/<(code|pre)/)
      , blockEnd = text.match(/<\/(code|pre)/);

    if (blockStart && !blockEnd) {
      this.inPreformattedBlock++;
      this.inPreformattedContent = false;
    }
  },

  preformattedBlockEnd: function(text) {
    var blockStart = text.match(/<(code|pre)/)
      , blockEnd = text.match(/<\/(code|pre)/);

    if (this.inPreformattedBlock && blockEnd) {
      this.inPreformattedBlock--;
      this.inPreformattedContent = false;
    }
  },

  expandAttributeShorthand: function(a) {
    switch (a) {
      case '<':
        return 'text-align: left';
      case '>':
        return 'text-align: right';
      case '=':
        return 'text-align: center';
      case '<>':
        return 'text-align: justify';
      case '^':
        return 'vertical-align: top';
      case '-':
        return 'vertical-align: middle';
      case '~':
        return 'vertical-align: bottom';
      default:
        return false;
    }
  },

  styleAttribute: function(text, attr) {
    var match = text.match(/^[^{]*{([^}]*)}[^.]*/)
      , style = ''
      , styles = []
      , expandedStyle = this.expandAttributeShorthand(attr);
    if (match) styles = match[1].split(';');
    if (expandedStyle) styles.push(expandedStyle);
    if (styles.length > 0) style = style + ' style="' + styles.join(';') + '"';
    return style;
  },

  classAttribute: function(text) {
    var match = text.match(/^[^(]*\(([^)]*)\)[^.]*/)
      , id = ''
      , classNames;
    if (match) {
      var values = match[1].split('#');
      classNames = values[0];
      if (values[1]) id = ' id="' + values[1] + '"';
      return ' class="' + classNames + '"' + id;
    }
    return '';
  },

  langAttribute: function(text) {
    var match = text.match(/^[^\[]*\[([^\]]*)\][^.]*/);
    if (match) return ' lang="' + match[1] + '"';
    return '';
  },

  blockAttributes: function(text, attr) {
    return this.classAttribute(text) +
           this.styleAttribute(text, attr) +
           this.langAttribute(text);
  },

  pushListType: function(match) {
    var listType = match[1].match(/#/) ? 'ol' : 'ul';
    this.listTypes.push(listType);
    return listType;
  },

  popListType: function() {
    return this.listTypes.pop();
  },

  matchList: function(text) {
    return text.match(/^(\#+|\*+)({[^}]*})?\s+(.*)/);
  },

  lists: function(text) {
    var match = this.matchList(text)
      , attr = this.blockAttributes(text)
      , listType
      , listContent;

    if (match)
      listContent = this.inline(match[3]);

    if (this.inList && match) {
      if (match[1].length > this.inList) {
        this.inList = match[1].length;
        listType = this.pushListType(match);
        return '  <' + listType + '>\n<li' + attr + '>' + listContent;
      } else if (match[1].length < this.inList) {
        this.inList--;
        listType = this.popListType();
        return '  </li>\n</' + listType + '><li' + attr + '>' + listContent;
      } else if (match[1].length == this.inList) {
        return '  </li>\n<li' + attr + '>' + listContent;
      }
      return '<li>' + listContent;
    } else if (match) {
      this.inList++;
      listType = this.pushListType(match);
      return '<' + listType + '>\n<li' + attr + '>' + listContent;
    }
  },

  matchTable: function(text) {
    return text.match(/^(<>|<|>|=|\^|-|~)*[^|]*\|(.*)\|\s*$/);
  },

  tables: function(text) {
    var match = this.matchTable(text)
      , result = ''
      , attr = '';
    if (match) {
      if (!this.inTable) {
        this.inTable++;
        result += '<table>\n';
      }

      attr = this.blockAttributes(text);

      result += '<tr' + attr + '>\n';
      var cells = match[2].split('|')
        , cellType
        , cell
        , r = /^((<>|<|>|=|\^|\/\d+|-|~|\\\d+)*(\{([^}]*)\})?(\[([^]]*)\])?(\(([^)]*)\))?\.\s?)/;
      for (var i = 0; i < cells.length; i++) {
        cell = cells[i];
        cellType = cell.match(/^_\./) ? (cell = cell.replace(/^_\.\s+/, '')) && 'th' : 'td';
        match = cell.match(r);
        attr = '';
        if (match) {
          cell = cell.replace(r, '');
          attr += this.blockAttributes(cells[i], match[1][0]);
          if (match[1]) {
            if (match[1][0] === '\\')
              attr += ' colspan="' + match[1].match(/\d+/)[0] + '"';
            if (match[1][0] === '/')
              attr += ' rowspan="' + match[1].match(/\d+/)[0] + '"';
          }
        }
        result += '<' + cellType + attr + '>' + this.inline(cell) + '</' + cellType + '>'
      }
      result += '</tr>\n';

      return result;
    } else {
      match = text.match(/^table([^.]*)?\./);
      if (match) {
        attr = this.blockAttributes(text);
        this.inTable++;
        return '<table' + attr + '>\n';
      }
    }
  },

  headers: function(text) {
    var headerType = text.match(/^(h[1-6])([^.]*)?\.\s+/);
    if (headerType && headerType[1])
      return this.block(headerType[1], headerType[1], text);
  },

  blockquotes: function(text) {
    return this.block('bq', 'blockquote', text);
  },

  paragraphs: function(text) {
    if (!text || text.length === 0) return;

    var m;
    // More block-level tags required?
    if (m = text.match(/<(blockquote|p|h[1-6]|pre|div|ul|ol|dir|menu|center|form|table|tr|td|tbody|th|thead|address|section|footer|title|meta|body|script|style|header|hgroup|br|dd|dl|dt|figure|fieldset|embed|col)>/i)) {
      if (!text.match('</' + m[1])) this.inExistingBlock++; 
      return text + '\n';
    } else if (text.trim().match(/^<\//)) {
      this.inExistingBlock--; 
      return text + '\n';
    } else if (this.inExistingBlock > 0) {
      return text + '\n';
    }
    var para = this.block('p', 'p', text);
    if (para) return para;
    return '<p>' + this.inline(text) + '</p>\n';
  },

  block: function(shorthand, tag, text) {
    var r = '^' + shorthand + '(<>|<|>|=|\\^|\\/\\d+|-|~|\\\\\\d+)*([^.]*)?\\.\\s+(.*)'
      , match = text.match(r)
      , attr = '';
    if (match) {
      attr = this.blockAttributes(text, match[1]);
      text = match[3];
      return '<' + tag + attr + '>' + this.inline(text) + '</' + tag + '>\n';
    }
  },

  inline: function(text) {
    text = this.links(text);

    text = text.replace(/!(([a-zA-Z0-9]|\/|\?)[^!\s]+)\((.*)\)!?(?![^<]*<\/(code|pre))/g, '<img src="$1" alt="$3" />');
    text = text.replace(/!(([a-zA-Z0-9]|\/|\?)[^!\s]+)!(?![^<]*<\/(code|pre))/g, '<img src="$1" alt="" />');
    text = text.replace(/\*([^*]*)\*(?![^<]*<\/)(?![^<]*>)/g, '<strong>$1</strong>');
    text = text.replace(/_([^_]*)_(?![^<]*<\/)(?![^<]*>)/g, '<em>$1</em>');
    text = text.replace(/\+([^+]*)\+(?![^<]*<\/)(?![^<]*>)/g, '<ins>$1</ins>');
    text = text.replace(/\-([^+]*)\-(?![^<]*<\/)(?![^<]*>)/g, '<del>$1</del>');
    text = text.replace(/\^([^+]*)\^(?![^<]*<\/)(?![^<]*>)/g, '<sup>$1</sup>');
    text = text.replace(/\~([^+]*)\~(?![^<]*<\/)(?![^<]*>)/g, '<sub>$1</sub>');
    text = text.replace(/\%([^+]*)\%(?![^<]*<\/)(?![^<]*>)/g, '<span>$1</span>');
    text = text.replace(/@([^+]*)@(?![^<]*<\/)(?![^<]*>)/g, '<code>$1</code>');
    text = text.replace(/\?\?([^+]*)\?\?(?![^<]*<\/)(?![^<]*>)/g, '<cite>$1</cite>');
    text = this.replaceEntities(text);

    return text;
  },

  replaceEntities: function(text) {
    var words = text.split(' ')
      , result = []
      , i
      , w
      , inPreformattedBlock = false
      , inTag = false
      , doubleQuotes = 0
      , singleQuotes = 0;

    for (i = 0; i < words.length; i++) {
      w = words[i];

      if (!inTag && w.match(/<./)) {
        inTag = true;
      }

      if (!inPreformattedBlock && !inTag) {
        if (!doubleQuotes && w.match(/"/)) {
          doubleQuotes++;
          w = w.replace(/"/, this.quotes.startDoubleQuote);
        }

        if (doubleQuotes && w.match(/"/)) {
          w = w.replace(/"/, this.quotes.endDoubleQuote);
          doubleQuotes--;
        }

        if (!singleQuotes && w.match(/^'/)) {
          singleQuotes++;
          w = w.replace(/'/, this.quotes.startSingleQuote);
        }

        if (singleQuotes && w.match(/'/)) {
          w = w.replace(/'/, this.quotes.endSingleQuote);
          singleQuotes--;
        }

        for (var entity in this.entities) {
          w = w.replace(new RegExp(this.entities[entity][0], 'g'),
                        this.entities[entity][1]);
        }
      }
      result.push(w);

      if (!inPreformattedBlock && w.match(/<(code|pre)/)) {
        inPreformattedBlock = true;
      } else if (inPreformattedBlock && w.match(/<\/(code|pre)/)) {
        inPreformattedBlock = false;
      }

      if (inTag && w.match(/>/) && !w.match(/<[^/]/)) {
        inTag = false;
      }
    }

    return result.join(' ');
  },

  replaceStrAtIndex: function(text, index, to, r) {
    return text.substr(0, index) + r + text.substr(to);
  },

  links: function(text) {
    var m
      , p
      , link
      , re = /"([^"(]*)(\s+\(([^)]*)\))?":([^ ]*)/g;
    while ((m = re.exec(text)) != null) {
      p = '';

      // Ignore things in preformatted tags
      if (m[0].match(/(pre|code)[^>]*>/)) continue;

      // Replace punctuation
      if (p = m[4].match(/[.,]$/)) {
        m[4] = m[4].replace(/[,.]$/, '');
      } else {
        p = '';
      }

      if (m[3]) {
        link = '<a title="' + m[3] + '" href="' + m[4] + '">' + m[1] + '</a>' + p;
      } else {
        link = '<a href="' + m[4] + '">' + m[1] + '</a>' + p;
      }
      text = this.replaceStrAtIndex(text, m.index, m.index + m[0].length, link);
    }

    return text;
  }
};

if (typeof module !== 'undefined')
  module.exports = function(text) {
    return (new Textile).parse(text);
  };
