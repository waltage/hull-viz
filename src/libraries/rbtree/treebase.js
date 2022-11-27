class TreeBase {
  constructor() {}
  // removes all nodes from the tree
  clear() {
    this._root = null;
    this.size = 0;
  }
  // returns node data if found, null otherwise
  find(data) {
    var res = this._root;

    while (res !== null) {
      var c = this._comparator(data, res.data);
      if (c === 0) {
        return res.data;
      } else {
        res = res.get_child(c > 0);
      }
    }

    return null;
  }
  // returns iterator to node if found, null otherwise
  findIter(data) {
    var res = this._root;
    var iter = this.iterator();

    while (res !== null) {
      var c = this._comparator(data, res.data);
      if (c === 0) {
        iter._cursor = res;
        return iter;
      } else {
        iter._ancestors.push(res);
        res = res.get_child(c > 0);
      }
    }

    return null;
  }
  // Returns an iterator to the tree node at or immediately after the item
  lowerBound(item) {
    var cur = this._root;
    var iter = this.iterator();
    var cmp = this._comparator;

    while (cur !== null) {
      var c = cmp(item, cur.data);
      if (c === 0) {
        iter._cursor = cur;
        return iter;
      }
      iter._ancestors.push(cur);
      cur = cur.get_child(c > 0);
    }

    for (var i = iter._ancestors.length - 1; i >= 0; --i) {
      cur = iter._ancestors[i];
      if (cmp(item, cur.data) < 0) {
        iter._cursor = cur;
        iter._ancestors.length = i;
        return iter;
      }
    }

    iter._ancestors.length = 0;
    return iter;
  }
  // Returns an iterator to the tree node immediately after the item
  upperBound(item) {
    var iter = this.lowerBound(item);
    var cmp = this._comparator;

    while (iter.data() !== null && cmp(iter.data(), item) === 0) {
      iter.next();
    }

    return iter;
  }
  // returns null if tree is empty
  min() {
    var res = this._root;
    if (res === null) {
      return null;
    }

    while (res.left !== null) {
      res = res.left;
    }

    return res.data;
  }
  // returns null if tree is empty
  max() {
    var res = this._root;
    if (res === null) {
      return null;
    }

    while (res.right !== null) {
      res = res.right;
    }

    return res.data;
  }
  // returns a null iterator
  // call next() or prev() to point to an element
  iterator() {
    return new Iterator(this);
  }
  // calls cb on each node's data, in order
  each(cb) {
    var it = this.iterator(),
      data;
    while ((data = it.next()) !== null) {
      if (cb(data) === false) {
        return;
      }
    }
  }
  // calls cb on each node's data, in reverse order
  reach(cb) {
    var it = this.iterator(),
      data;
    while ((data = it.prev()) !== null) {
      if (cb(data) === false) {
        return;
      }
    }
  }
}

class Iterator {
  constructor(tree) {
    this._tree = tree;
    this._ancestors = [];
    this._cursor = null;
  }
  data() {
    return this._cursor !== null ? this._cursor.data : null;
  }
  // if null-iterator, returns first node
  // otherwise, returns next node
  next() {
    if (this._cursor === null) {
      var root = this._tree._root;
      if (root !== null) {
        this._minNode(root);
      }
    } else {
      if (this._cursor.right === null) {
        // no greater node in subtree, go up to parent
        // if coming from a right child, continue up the stack
        var save;
        do {
          save = this._cursor;
          if (this._ancestors.length) {
            this._cursor = this._ancestors.pop();
          } else {
            this._cursor = null;
            break;
          }
        } while (this._cursor.right === save);
      } else {
        // get the next node from the subtree
        this._ancestors.push(this._cursor);
        this._minNode(this._cursor.right);
      }
    }
    return this._cursor !== null ? this._cursor.data : null;
  }
  // if null-iterator, returns last node
  // otherwise, returns previous node
  prev() {
    if (this._cursor === null) {
      var root = this._tree._root;
      if (root !== null) {
        this._maxNode(root);
      }
    } else {
      if (this._cursor.left === null) {
        var save;
        do {
          save = this._cursor;
          if (this._ancestors.length) {
            this._cursor = this._ancestors.pop();
          } else {
            this._cursor = null;
            break;
          }
        } while (this._cursor.left === save);
      } else {
        this._ancestors.push(this._cursor);
        this._maxNode(this._cursor.left);
      }
    }
    return this._cursor !== null ? this._cursor.data : null;
  }
  _minNode(start) {
    while (start.left !== null) {
      this._ancestors.push(start);
      start = start.left;
    }
    this._cursor = start;
  }
  _maxNode(start) {
    while (start.right !== null) {
      this._ancestors.push(start);
      start = start.right;
    }
    this._cursor = start;
  }
}

export { TreeBase, Iterator };
